"use server";

import { revalidatePath } from "next/cache";
import { requireTenant, TenantError } from "@/lib/tenant";

export async function deleteCustomer(customerId: string) {
  try {
    const { db } = await requireTenant();

    // Verificar se o cliente tem orçamentos ou ordens de serviço vinculadas
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: {
            budgets: true,
            serviceOrders: true,
          },
        },
      },
    });

    if (!customer) {
      return { success: false, message: "Cliente não encontrado." };
    }

    if (customer._count.budgets > 0 || customer._count.serviceOrders > 0) {
      return {
        success: false,
        message:
          "Não é possível excluir um cliente com histórico de orçamentos ou ordens de serviço.",
      };
    }

    await db.customer.delete({
      where: { id: customerId },
    });

    revalidatePath("/dashboard/customer");

    return { success: true, message: "Cliente removido com sucesso!" };
  } catch (error) {
    if (error instanceof TenantError) {
      return { success: false, message: error.message };
    }
    console.error("Erro ao excluir cliente:", error);
    return {
      success: false,
      message: "Erro interno ao tentar excluir o cliente.",
    };
  }
}
