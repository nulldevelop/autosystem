"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getBudgets(page = 1, pageSize = 10) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const skip = (page - 1) * pageSize;

  const [budgets, totalCount] = await Promise.all([
    prisma.budget.findMany({
      where: {
        organizationId: session.session.activeOrganizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            name: true,
          },
        },
        vehicle: {
          select: {
            marca: true,
            model: true,
            licensePlate: true,
          },
        },
        serviceOrder: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.budget.count({
      where: {
        organizationId: session.session.activeOrganizationId,
      },
    }),
  ]);

  return {
    budgets,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  };
}
