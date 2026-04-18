"use server";

import { prisma } from "@/lib/prisma";

export async function getProductsCount(orgId: string) {
  if (!orgId) return 0;

  const products = await prisma.product.findMany({
    where: {
      organizationId: orgId,
    },
    select: {
      sku: true,
    },
  });

  return products.filter(
    (product) =>
      !product.sku.startsWith("CUSTOM-") &&
      !product.sku.startsWith("GENERIC-CUSTOM-"),
  ).length;
}
