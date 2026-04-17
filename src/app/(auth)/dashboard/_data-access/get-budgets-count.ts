"use server";

import { prisma } from "@/lib/prisma";

export async function getBudgetsCount(orgId: string) {
  if (!orgId) return 0;

  return prisma.budget.count({
    where: { organizationId: orgId },
  });
}
