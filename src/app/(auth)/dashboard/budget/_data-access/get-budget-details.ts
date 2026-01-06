"use server";

import { prisma } from "@/lib/prisma";

export async function getBudgetDetails(budgetId: string) {
  const budget = await prisma.budget.findUnique({
    where: {
      id: budgetId,
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
    },
  });

  return budget;
}

export type BudgetDetails = NonNullable<Awaited<ReturnType<typeof getBudgetDetails>>>;
