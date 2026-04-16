"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addBudgetPhoto(budgetId: string, url: string) {
  try {
    const photo = await prisma.budgetPhoto.create({
      data: {
        budgetId,
        url,
      },
    });

    revalidatePath(`/dashboard/budget/${budgetId}`);

    return { success: true, photo };
  } catch (error) {
    console.error("Erro ao salvar foto do orçamento:", error);
    return {
      success: false,
      message: "Erro ao salvar referência da foto no banco de dados.",
    };
  }
}
