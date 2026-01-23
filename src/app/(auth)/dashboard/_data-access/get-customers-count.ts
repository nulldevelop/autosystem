"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getCustomersCount() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const count = await prisma.customer.count({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
  });

  return count;
}
