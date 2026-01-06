"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { getBudgetDetails } from "../_data-access/get-budget-details"; // Updated import path

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

    const validationResult = createServiceOrderSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        message: "ID do orçamento inválido.",
      };
    }

    const { budgetId } = validationResult.data;

    const existingServiceOrder = await prisma.serviceOrder.findUnique({
      where: {
        budgetId,
      },
    });

    if (existingServiceOrder) {
      return {
        success: true,
        message: "Ordem de Serviço já existe.",
        serviceOrderId: existingServiceOrder.id,
      };
    }

    const budget = await getBudgetDetails(budgetId);

    if (!budget) {
      return {
        success: false,
        message: "Orçamento não encontrado.",
      };
    }

    const serviceOrder = await prisma.$transaction(async (tx) => {
      await tx.budget.update({
        where: { id: budgetId },
        data: { status: "aproved" },
      });

      const newServiceOrder = await tx.serviceOrder.create({
        data: {
          budgetId,
          customerId: budget.customerId,
          vehicleId: budget.vehicleId,
          totalAmount: budget.totalAmount,
          observacoes: budget.observacoes,
          organizationId: session.session.activeOrganizationId,
        },
      });

      const serviceOrderItemsData = budget.items.map((item) => ({
        serviceOrderId: newServiceOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      await tx.serviceOrderItem.createMany({
        data: serviceOrderItemsData,
      });

      return newServiceOrder;
    });

    revalidatePath("/dashboard/budget");
    return {
      success: true,
      message: "Ordem de Serviço criada com sucesso!",
      serviceOrderId: serviceOrder.id,
    };
  } catch (error: unknown) {
    console.error("Erro ao criar Ordem de Serviço:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ocorreu um erro ao criar a Ordem de Serviço.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}
