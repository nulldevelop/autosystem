"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getServiceOrders(page = 1, pageSize = 10) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const skip = (page - 1) * pageSize;

  const [serviceOrders, totalCount] = await Promise.all([
    prisma.serviceOrder.findMany({
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
        status: true,
        totalAmount: true,
        createdAt: true,
        customer: {
          select: { name: true },
        },
        vehicle: {
          select: { marca: true, model: true, licensePlate: true },
        },
        budget: {
          select: { id: true },
        },
      },
    }),
    prisma.serviceOrder.count({
      where: { organizationId: session.session.activeOrganizationId },
    }),
  ]);

  return {
    serviceOrders,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  };
}
