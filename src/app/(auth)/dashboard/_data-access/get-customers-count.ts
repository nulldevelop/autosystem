"use server";

import { prisma } from "@/lib/prisma";

export async function getCustomersCount(orgId: string) {
  if (!orgId) return 0;

  return prisma.customer.count({
    where: { organizationId: orgId },
  });
}
