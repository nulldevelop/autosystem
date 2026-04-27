"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getCustomers(page = 1, pageSize = 10) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const skip = (page - 1) * pageSize;

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where: {
        organizationId: session.session.activeOrganizationId,
      },
      orderBy: {
        name: "asc",
      },
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        createdAt: true,
      },
    }),
    prisma.customer.count({
      where: {
        organizationId: session.session.activeOrganizationId,
      },
    }),
  ]);

  return {
    customers,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  };
}
