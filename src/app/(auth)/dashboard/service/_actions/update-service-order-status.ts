"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ServiceOrderStatus } from "@/generated/prisma/client";
import { getTenant } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { canPermission } from "@/utils/permissions/canPermission";

const updateServiceOrderStatusSchema = z.object({
  serviceOrderId: z.string(),
  status: z.nativeEnum(ServiceOrderStatus),
});

export async function updateServiceOrderStatus(
  input: z.infer<typeof updateServiceOrderStatusSchema>,
) {
  const { serviceOrderId, status } =
    updateServiceOrderStatusSchema.parse(input);

  // Oficina ativa da sessão (e o usuário precisa ser membro dela)
  const tenant = await getTenant();

  if (!tenant) {
    return {
      success: false,
      message: "Usuário não autenticado ou sem oficina ativa.",
    };
  }

  const organization = { id: tenant.organizationId };

  try {
    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: {
        id: serviceOrderId,
        organizationId: organization.id,
      },
    });

    if (!serviceOrder) {
      return { success: false, message: "Ordem de Serviço não encontrada." };
    }

    if (serviceOrder.status === "canceled" && status !== "canceled") {
      const permission = await canPermission({ type: "service" });

      if (!permission.hasPermission) {
        if (permission.expired) {
          return {
            success: false,
            message:
              "Sua assinatura expirou. Por favor, renove sua assinatura para continuar.",
          };
        }

        const planName = permission.plan?.maxServices
          ? `Você atingiu o limite de ${permission.plan.maxServices} ordens de serviço do plano ${permission.planId}.`
          : "Você não tem permissão para reativar esta ordem de serviço.";

        return {
          success: false,
          message: `${planName} Faça upgrade do seu plano para continuar.`,
        };
      }
    }

    await prisma.serviceOrder.update({
      where: {
        id: serviceOrderId,
        organizationId: organization.id,
      },
      data: {
        status,
      },
    });

    if (status === "completed") {
      await prisma.transaction.updateMany({
        where: {
          serviceOrderId: serviceOrderId,
          organizationId: organization.id,
          type: "INCOME",
        },
        data: {
          status: "PAID",
          paymentDate: new Date(),
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/service");
    revalidatePath("/dashboard/financeiro");
    return {
      success: true,
      message: "Status da Ordem de Serviço atualizado com sucesso!",
    };
  } catch (error) {
    console.error("Error updating service order status:", error);
    return {
      success: false,
      message: "Erro ao atualizar o status da Ordem de Serviço.",
    };
  }
}
