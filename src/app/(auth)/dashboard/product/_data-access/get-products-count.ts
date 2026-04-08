"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getProductsCount() {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    return 0;
  }

  const count = await prisma.product.count({
    where: {
      organizationId: session.session.activeOrganizationId,
      NOT: [
        {
          sku: {
            startsWith: "CUSTOM-",
          },
        },
        {
          sku: {
            startsWith: "GENERIC-CUSTOM-",
          },
        },
      ],
    },
  });

  return count;
}
