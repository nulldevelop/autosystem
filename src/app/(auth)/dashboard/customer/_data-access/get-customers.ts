"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getCustomers() {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const customers = await prisma.customer.findMany({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return customers;
}
