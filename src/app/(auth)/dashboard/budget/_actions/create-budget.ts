"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { canPermission } from "@/utils/permissions/canPermission";

const createBudgetSchema = z.object({
  customerId: z.uuid({
    message: "ID do cliente inválido.",
  }),
  vehicleId: z.uuid({
    message: "ID do veículo inválido.",
  }),
  observacoes: z.string().optional(),
  profitMargin: z.number().min(0, {
    message: "A margem de lucro não pode ser negativa.",
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string().optional(),
        quantity: z.number().min(1, {
          message: "A quantidade deve ser pelo menos 1.",
        }),
        unitPrice: z.number().min(0, {
          message: "O preço unitário não pode ser negativo.",
        }),
      }),
    )
    .min(1, {
      message: "Adicione pelo menos um item ao orçamento.",
    }),
});

interface CreateBudgetInput {
  customerId: string;
  vehicleId: string;
  observacoes?: string;
  profitMargin: number;
  items: Array<{
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface CreateBudgetResponse {
  success: boolean;
  message: string;
  budgetId?: string;
}

export async function createBudget(
  input: CreateBudgetInput,
): Promise<CreateBudgetResponse> {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      return {
        success: false,
        message: "Você precisa estar autenticado e ter uma organização ativa.",
      };
    }

    const validationResult = createBudgetSchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Dados inválidos",
      };
    }

    const permission = await canPermission({ type: "budget" });

    if (!permission.hasPermission) {
      return {
        success: false,
        message: "Você atingiu o limite de orçamentos do seu plano.",
      };
    }

    const { customerId, vehicleId, profitMargin, items } = validationResult.data;
    let { observacoes } = validationResult.data;

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const finalAmountWithProfit = totalAmount * (1 + profitMargin / 100);

    // Identificar itens customizados para adicionar nas observações
    const customItemsText = items
      .filter(item => item.productId.startsWith("custom-"))
      .map(item => `${item.productName} (${item.quantity}x ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)})`)
      .join(", ");

    if (customItemsText) {
      observacoes = observacoes 
        ? `${observacoes}\n\nItens Adicionais: ${customItemsText}`
        : `Itens Adicionais: ${customItemsText}`;
    }

    const budget = await prisma.$transaction(async (tx) => {
      const newBudget = await tx.budget.create({
        data: {
          customerId,
          vehicleId,
          totalAmount: finalAmountWithProfit,
          observacoes,
          organizationId: session.session.activeOrganizationId,
        },
      });

      for (const item of items) {
        const isCustom = item.productId.startsWith("custom-");
        let productId = item.productId;

        if (isCustom) {
          const customProduct = await tx.product.create({
            data: {
              name: item.productName || "Item Customizado",
              sku: `CUSTOM-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              price: item.unitPrice,
              organizationId: session.session.activeOrganizationId,
            },
          });
          productId = customProduct.id;
        }

        await tx.budgetItem.create({
          data: {
            budgetId: newBudget.id,
            productId: productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }

      return newBudget;
    });
    revalidatePath("/dashboard/budget");
    return {
      success: true,
      message: "Orçamento criado com sucesso!",
      budgetId: budget.id,
    };
  } catch (error: unknown) {
    console.error("Erro ao criar orçamento:", error);
    return {
      success: false,
      message: "Erro ao criar orçamento.",
    };
  }
}
