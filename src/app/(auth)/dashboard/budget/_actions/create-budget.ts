"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const createBudgetSchema = z.object({
  customerId: z.string().uuid({
    message: "ID do cliente inválido.",
  }),
  vehicleId: z.string().uuid({
    message: "ID do veículo inválido.",
  }),
  totalAmount: z.number().positive({
    message: "O valor total deve ser um número positivo.",
  }),
  observacoes: z.string().optional(),
});

interface CreateBudgetInput {
  customerId: string;
  vehicleId: string;
  totalAmount: number;
  observacoes?: string;
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
        errors.totalAmount?.[0] ||
        "Dados inválidos";

      return {
        success: false,
        message: firstError,
      };
    }

    const { customerId, vehicleId, totalAmount, observacoes } =
      validationResult.data;

    const budget = await prisma.budget.create({
      data: {
        customerId,
        vehicleId,
        totalAmount,
        observacoes,
        organizationId: session.session.activeOrganizationId,
      },
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
