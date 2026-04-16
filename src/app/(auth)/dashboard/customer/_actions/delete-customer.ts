"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteCustomer(customerId: string) {
  try {
    // Verificar se o cliente tem orçamentos ou ordens de serviço vinculadas
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: {
            budgets: true,
            serviceOrders: true
          }
        }
      }
    });

    if (!customer) {
      return { success: false, message: "Cliente não encontrado." };
    }

    if (customer._count.budgets > 0 || customer._count.serviceOrders > 0) {
      return { 
        success: false, 
        message: "Não é possível excluir um cliente com histórico de orçamentos ou ordens de serviço." 
      };
    }

    await prisma.customer.delete({
      where: { id: customerId },
    });

    revalidatePath("/dashboard/customer");
    
    return { success: true, message: "Cliente removido com sucesso!" };
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return { success: false, message: "Erro interno ao tentar excluir o cliente." };
  }
}
