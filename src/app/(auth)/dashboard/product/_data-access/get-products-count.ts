"use server";

import { prisma } from "@/lib/prisma";

export async function getProductsCount(orgId: string) {
  if (!orgId) return 0;

  return prisma.product.count({
    where: {
      organizationId: orgId,
      NOT: [
        { sku: { startsWith: "CUSTOM-" } },
        { sku: { startsWith: "GENERIC-CUSTOM-" } },
      ],
    },
  });
}
