"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function signBudget(budgetId: string, signatureBase64: string) {
  try {
    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        signature: signatureBase64,
        signedAt: new Date(),
        status: "aproved",
      },
      include: {
        customer: true,
        vehicle: true,
        organization: true,
      },
    });

    if (budget.organizationId) {
      await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          type: "BUDGET_SIGNED",
          title: "Orçamento Assinado!",
          message: `${budget.customer?.name || "Cliente"} assinou o orçamento de ${budget.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} para ${budget.vehicle?.marca} ${budget.vehicle?.model}.`,
          organizationId: budget.organizationId,
          budgetId: budget.id,
          customerId: budget.customerId,
        },
      });
    }

    revalidatePath(`/budget/sign/${budgetId}`);
    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard/budget");
    return { success: true };
  } catch (error) {
    console.error("Erro ao assinar orçamento:", error);
    return { success: false, error: "Falha ao processar assinatura" };
  }
}
