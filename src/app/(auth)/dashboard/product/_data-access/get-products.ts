"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
export async function getProducts(page = 1, pageSize = 10) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const skip = (page - 1) * pageSize;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
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
        sku: true,
        price: true,
        stockQuantity: true,
        unit: true,
        category: true,
      },
    }),
    prisma.product.count({
      where: {
        organizationId: session.session.activeOrganizationId,
      },
    }),
  ]);

  return {
    products,
    totalPages: Math.ceil(totalCount / pageSize),
    totalCount,
  };
}
