"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getProducts() {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const products = await prisma.product.findMany({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return products.filter(
    (product) =>
      !product.sku.startsWith("CUSTOM-") &&
      !product.sku.startsWith("GENERIC-CUSTOM-"),
  );
}
