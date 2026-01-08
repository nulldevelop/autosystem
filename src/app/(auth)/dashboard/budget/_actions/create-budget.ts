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
      const firstError =
        errors.customerId?.[0] ||
        errors.vehicleId?.[0] ||
        errors.profitMargin?.[0] ||
        errors.items?.[0] ||
        "Dados inválidos";

      return {
        success: false,
        message: firstError,
      };
    }

    // Verificar permissões antes de criar o orçamento
    const permission = await canPermission({ type: "budget" });

    if (!permission.hasPermission) {
      if (permission.expired) {
        return {
          success: false,
          message: "Sua assinatura expirou. Por favor, renove sua assinatura para continuar criando orçamentos.",
        };
      }

      const planName = permission.plan?.maxBudgets
        ? `Você atingiu o limite de ${permission.plan.maxBudgets} orçamentos do plano ${permission.planId}.`
        : "Você não tem permissão para criar mais orçamentos.";

      return {
        success: false,
        message: `${planName} Faça upgrade do seu plano para continuar.`,
      };
    }

    const { customerId, vehicleId, observacoes, profitMargin, items } =
      validationResult.data;

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const finalAmountWithProfit = totalAmount * (1 + profitMargin / 100);

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
        let productId = item.productId;

        if (item.productId.startsWith("custom-")) {
          if (!item.productName) {
            throw new Error("Nome do produto é obrigatório para produtos customizados.");
          }
          const newProduct = await tx.product.create({
            data: {
              name: item.productName,
              price: item.unitPrice,
              organizationId: session.session.activeOrganizationId,
              sku: `${item.productName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
            },
          });
          productId = newProduct.id;
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

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ocorreu um erro ao criar o orçamento.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

