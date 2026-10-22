"use server";

import { revalidatePath } from "next/cache";
import { requireTenant, TenantError } from "@/lib/tenant";

export async function deleteVehicle(vehicleId: string) {
  try {
    const { db } = await requireTenant();

    // Verificar se o veículo tem orçamentos ou ordens de serviço vinculadas
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        _count: {
          select: {
            budgets: true,
            serviceOrders: true,
          },
        },
      },
    });

    if (!vehicle) {
      return { success: false, message: "Veículo não encontrado." };
    }

    if (vehicle._count.budgets > 0 || vehicle._count.serviceOrders > 0) {
      return {
        success: false,
        message:
          "Não é possível excluir um veículo com histórico de orçamentos ou ordens de serviço.",
      };
    }

    await db.vehicle.delete({
      where: { id: vehicleId },
    });

    revalidatePath("/dashboard/vehicle");

    return { success: true, message: "Veículo removido com sucesso!" };
  } catch (error) {
    if (error instanceof TenantError) {
      return { success: false, message: error.message };
    }
    console.error("Erro ao excluir veículo:", error);
    return {
      success: false,
      message: "Erro interno ao tentar excluir o veículo.",
    };
  }
}
