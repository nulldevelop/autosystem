"use server";

import { prisma } from "@/lib/prisma";

export async function getVehiclesCount(orgId: string) {
  if (!orgId) return 0;

  return prisma.vehicle.count({
    where: { organizationId: orgId },
  });
}
