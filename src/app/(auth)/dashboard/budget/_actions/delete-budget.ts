"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function deleteBudget(budgetId: string) {
  try {
    const session = await getSession();
    const orgId = session?.session.activeOrganizationId;

    if (!orgId) {
      return { success: false, message: "Não autorizado." };
    }

    // Verifica se o orçamento existe e se pertence à organização ativa
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        organizationId: orgId,
      },
      include: { serviceOrder: true },
    });

    if (!budget) {
      return { success: false, message: "Orçamento não encontrado." };
    }

    if (budget.serviceOrder) {
      return {
        success: false,
        message:
          "Não é possível excluir um orçamento com Ordem de Serviço vinculada.",
      };
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    revalidatePath("/dashboard/budget");

    return { success: true, message: "Orçamento excluído com sucesso!" };
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    return {
      success: false,
      message: "Erro interno ao tentar excluir o orçamento.",
    };
  }
}
