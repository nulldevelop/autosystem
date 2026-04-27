"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getBudgetDetails(budgetId: string) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    return null;
  }

  const budget = await prisma.budget.findFirst({
    where: {
      id: budgetId,
      organizationId: session.session.activeOrganizationId,
    },
    include: {
      customer: true,
      vehicle: true,
      organization: true,
      items: {
        include: {
          product: true,
        },
      },
      photos: true,
      serviceOrder: true,
    },
  });

  return budget;
}

export type BudgetDetails = NonNullable<
  Awaited<ReturnType<typeof getBudgetDetails>>
>;
