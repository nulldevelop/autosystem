"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getBudgetsCount() {
  const session = await getSession();

  if (!session?.session.activeOrganizationId) {
    return 0;
  }

  return prisma.budget.count({
    where: { organizationId: session.session.activeOrganizationId },
  });
}
