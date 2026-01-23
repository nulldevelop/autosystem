"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getVehiclesCount() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const count = await prisma.vehicle.count({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
  });

  return count;
}
