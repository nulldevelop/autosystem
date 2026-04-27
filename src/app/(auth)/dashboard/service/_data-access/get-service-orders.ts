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
      include: {
        customer: true,
        vehicle: true,
        organization: true,
        budget: {
          include: {
            customer: true,
            vehicle: true,
            organization: true,
            serviceOrder: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
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
