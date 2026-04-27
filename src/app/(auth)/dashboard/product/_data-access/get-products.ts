"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
export async function getProducts(page = 1, pageSize = 10, search?: string) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const skip = (page - 1) * pageSize;

  const where = {
    organizationId: session.session.activeOrganizationId,
    ...(search && {
      OR: [{ name: { contains: search } }, { sku: { contains: search } }],
    }),
  };

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: {
        name: "asc",
      },
      skip,
      take: pageSize,
    }),
    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  };
}
