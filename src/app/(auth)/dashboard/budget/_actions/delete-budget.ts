"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteBudget(budgetId: string) {
  try {
    // Verifica se o orçamento existe e se não tem uma OS vinculada
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { serviceOrder: true }
    });

    if (!budget) {
      return { success: false, message: "Orçamento não encontrado." };
    }

    if (budget.serviceOrder) {
      return { success: false, message: "Não é possível excluir um orçamento com Ordem de Serviço vinculada." };
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    revalidatePath("/dashboard/budget");
    
    return { success: true, message: "Orçamento excluído com sucesso!" };
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    return { success: false, message: "Erro interno ao tentar excluir o orçamento." };
  }
}
