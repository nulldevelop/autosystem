"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { canPermission } from "@/utils/permissions/canPermission";
import { getBudgetDetails } from "../_data-access/get-budget-details";

const createServiceOrderSchema = z.object({
  budgetId: z.string().uuid({
    message: "ID do orçamento inválido.",
  }),
});

interface CreateServiceOrderInput {
  budgetId: string;
}

interface CreateServiceOrderResponse {
  success: boolean;
  message: string;
  serviceOrderId?: string;
}

export async function createServiceOrder(
  input: CreateServiceOrderInput,
): Promise<CreateServiceOrderResponse> {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      return {
        success: false,
        message: "Você precisa estar autenticado e ter uma organização ativa.",
      };
    }

    const orgId = session.session.activeOrganizationId;
    const validationResult = createServiceOrderSchema.safeParse(input);

    if (!validationResult.success) {
      return { success: false, message: "ID do orçamento inválido." };
    }

    const { budgetId } = validationResult.data;

    const existingServiceOrder = await prisma.serviceOrder.findUnique({
      where: { budgetId },
    });

    if (existingServiceOrder) {
      return {
        success: true,
        message: "Ordem de Serviço já existe.",
        serviceOrderId: existingServiceOrder.id,
      };
    }

    const permission = await canPermission({ type: "service" });

    if (!permission.hasPermission) {
      return {
        success: false,
        message: permission.expired
          ? "Sua assinatura expirou."
          : "Limite de plano atingido.",
      };
    }

    const budget = await getBudgetDetails(budgetId);

    if (!budget) {
      return { success: false, message: "Orçamento não encontrado." };
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Aprovar o orçamento
      await tx.budget.update({
        where: { id: budgetId },
        data: { status: "aproved" },
      });

      // 2. Criar a Ordem de Serviço
      const newServiceOrder = await tx.serviceOrder.create({
        data: {
          budgetId,
          customerId: budget.customerId,
          vehicleId: budget.vehicleId,
          // biome-ignore lint/suspicious/noExplicitAny: budget relation type is partial
          itemsAmount: (budget as any).itemsAmount || 0,
          // biome-ignore lint/suspicious/noExplicitAny: budget relation type is partial
          laborValue: (budget as any).laborValue || 0,
          totalAmount: budget.totalAmount,
          observacoes: budget.observacoes,
          organizationId: orgId,
        },
      });

      let totalCostAmount = 0;

      // 3. Processar itens (Estoque + Histórico)
      for (const item of budget.items) {
        const isCustom = item.product.sku.startsWith("CUST-");

        if (!isCustom) {
          // 3a. Verificar Disponibilidade
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stockQuantity: true, name: true },
          });

          if (!product) {
            throw new Error(`Produto ${item.product.name} não encontrado.`);
          }

          if (product.stockQuantity < item.quantity) {
            throw new Error(
              `Estoque insuficiente para: ${product.name}. Disponível: ${product.stockQuantity}`,
            );
          }

          // 3b. Atualiza estoque
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });

          // 3c. Registra movimento de estoque
          await tx.productMovement.create({
            data: {
              productId: item.productId,
              type: "OUT",
              quantity: item.quantity,
              reason: `Ordem de Serviço #${newServiceOrder.id.substring(0, 8)}`,
            },
          });
        }

        // Criar item da OS (Independente de ser customizado ou não)
        await tx.serviceOrderItem.create({
          data: {
            serviceOrderId: newServiceOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });

        // Somar custo total para o financeiro
        totalCostAmount += item.product.costPrice * item.quantity;
      }

      // 4. Gerar Transação Financeira Automática
      await tx.transaction.create({
        data: {
          description: `Receita OS #${newServiceOrder.id.substring(0, 8)} - ${budget.customer.name}`,
          amount: budget.totalAmount, // Bruto
          costAmount: totalCostAmount, // Peças/Custo
          netAmount: budget.totalAmount - totalCostAmount, // Limpo (Mão de obra + Lucro)
          type: "INCOME",
          category: "SERVICE",
          status: "PENDING", // Inicia como pendente até o pagamento real
          dueDate: new Date(),
          serviceOrderId: newServiceOrder.id,
          organizationId: orgId,
        },
      });

      return newServiceOrder;
    });

    revalidatePath("/dashboard/budget");
    revalidatePath("/dashboard/financeiro");
    revalidatePath("/dashboard/product");

    return {
      success: true,
      message:
        "OS gerada com sucesso! Estoque atualizado e financeiro provisionado.",
      serviceOrderId: result.id,
    };
  } catch (error: unknown) {
    console.error("Erro ao criar Ordem de Serviço:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro ao processar OS.",
    };
  }
}
