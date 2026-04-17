"use server";

import { prisma } from "@/lib/prisma";

export async function getServiceOrdersCount(orgId: string) {
  if (!orgId) return 0;

  return prisma.serviceOrder.count({
    where: { organizationId: orgId },
  });
}
