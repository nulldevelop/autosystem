"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function signServiceOrder(
  serviceOrderId: string,
  signatureData: string,
) {
  try {
    const serviceOrder = await prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: {
        signature: signatureData,
        signedAt: new Date(),
        status: "in_progress",
      },
      include: {
        customer: true,
        vehicle: true,
        organization: true,
      },
    });

    if (serviceOrder.organizationId) {
      await prisma.notification.create({
        data: {
          id: crypto.randomUUID(),
          type: "SERVICE_ORDER_SIGNED",
          title: "O.S. Assinada!",
          message: `${serviceOrder.customer?.name || "Cliente"} assinou a ordem de serviço para ${serviceOrder.vehicle?.marca} ${serviceOrder.vehicle?.model}.`,
          organizationId: serviceOrder.organizationId,
          serviceOrderId: serviceOrder.id,
          customerId: serviceOrder.customerId,
        },
      });
    }

    revalidatePath(`/dashboard/service/${serviceOrderId}`);
    revalidatePath(`/service/sign/${serviceOrderId}`);
    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard/service");

    return { success: true, message: "Ordem de serviço assinado com sucesso!" };
  } catch (error) {
    console.error("Erro ao assinar O.S.:", error);
    return { success: false, message: "Erro ao salvar assinatura." };
  }
}
