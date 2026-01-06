"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getServiceOrdersCount() {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    return 0;
  }

  const count = await prisma.serviceOrder.count({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
  });

  return count;
}
