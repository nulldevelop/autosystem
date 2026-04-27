"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getCustomers(page = 1, pageSize = 10, search?: string) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const skip = (page - 1) * pageSize;

  const where = {
    organizationId: session.session.activeOrganizationId,
    ...(search && {
      OR: [{ name: { contains: search } }, { document: { contains: search } }],
    }),
  };

  const [customers, totalCount] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      skip,
      take: pageSize,
    }),
    prisma.customer.count({
      where,
    }),
  ]);

  return {
    customers,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  };
}
