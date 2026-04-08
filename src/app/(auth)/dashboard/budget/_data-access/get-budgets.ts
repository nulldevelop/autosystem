"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getBudgets() {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const budgets = await prisma.budget.findMany({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      vehicle: true,
      customer: true,
      organization: true,
      serviceOrder: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return budgets;
}
