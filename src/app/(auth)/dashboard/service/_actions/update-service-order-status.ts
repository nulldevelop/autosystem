"use server";

import { z } from "zod";
import { ServiceOrderStatus } from "@/generated/prisma/client";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const updateServiceOrderStatusSchema = z.object({
  serviceOrderId: z.string(),
  status: z.nativeEnum(ServiceOrderStatus),
});

export async function updateServiceOrderStatus(
  input: z.infer<typeof updateServiceOrderStatusSchema>,
) {
  const { serviceOrderId, status } = updateServiceOrderStatusSchema.parse(input);

  const organization = await getActiveOrganization();

  if (!organization) {
    return { success: false, message: "Organização não encontrada." };
  }

  try {
    await prisma.serviceOrder.update({
      where: {
        id: serviceOrderId,
        organizationId: organization.id,
      },
      data: {
        status,
      },
    });

    revalidatePath("/dashboard/service");
    return { success: true, message: "Status da Ordem de Serviço atualizado com sucesso!" };
  } catch (error) {
    console.error("Error updating service order status:", error);
    return { success: false, message: "Erro ao atualizar o status da Ordem de Serviço." };
  }
}
