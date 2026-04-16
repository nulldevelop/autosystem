"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function signBudget(budgetId: string, signatureBase64: string) {
  try {
    await prisma.budget.update({
      where: { id: budgetId },
      data: {
        signature: signatureBase64,
        signedAt: new Date(),
        status: "aproved",
      },
    });

    revalidatePath(`/budget/sign/${budgetId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao assinar orçamento:", error);
    return { success: false, error: "Falha ao processar assinatura" };
  }
}
