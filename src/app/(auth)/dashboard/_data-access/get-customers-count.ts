"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getCustomersCount() {
  const session = await getSession();

  if (!session?.session.activeOrganizationId) {
    return 0;
  }

  return prisma.customer.count({
    where: { organizationId: session.session.activeOrganizationId },
  });
}
