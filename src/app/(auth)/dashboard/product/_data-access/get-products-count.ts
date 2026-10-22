"use server";

import { getTenant } from "@/lib/tenant";

export async function getProductsCount() {
  const tenant = await getTenant();
  if (!tenant) return 0;

  const products = await tenant.db.product.findMany({
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
