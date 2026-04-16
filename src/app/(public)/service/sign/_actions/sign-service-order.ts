"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function signServiceOrder(
  serviceOrderId: string,
  signatureData: string,
) {
  try {
    const _serviceOrder = await prisma.serviceOrder.update({
      where: { id: serviceOrderId },
      data: {
        signature: signatureData,
        signedAt: new Date(),
        status: "in_progress", // Move to in_progress when signed
      },
    });

    revalidatePath(`/dashboard/service/${serviceOrderId}`);
    revalidatePath(`/service/sign/${serviceOrderId}`);

    return { success: true, message: "Ordem de serviço assinada com sucesso!" };
  } catch (error) {
    console.error("Erro ao assinar O.S.:", error);
    return { success: false, message: "Erro ao salvar assinatura." };
  }
}
