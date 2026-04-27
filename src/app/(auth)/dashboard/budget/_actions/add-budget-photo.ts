"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function addBudgetPhoto(budgetId: string, url: string) {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      return { success: false, message: "Não autorizado." };
    }

    const orgId = session.session.activeOrganizationId;

    // Validar se o orçamento pertence à organização antes de salvar a foto
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        organizationId: orgId,
      },
      select: { id: true },
    });

    if (!budget) {
      return {
        success: false,
        message: "Orçamento não encontrado ou acesso negado.",
      };
    }

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
