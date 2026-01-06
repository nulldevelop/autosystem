"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getVehicles() {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
    include: {
      customer: true, // Include related customer data
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return vehicles;
}
