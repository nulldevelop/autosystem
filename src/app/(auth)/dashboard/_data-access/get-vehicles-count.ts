"use server";

import { getTenant } from "@/lib/tenant";

export async function getVehiclesCount() {
  const tenant = await getTenant();
  if (!tenant) return 0;

  return tenant.db.vehicle.count();
}
