"use server";

import { getTenant } from "@/lib/tenant";

export async function getServiceOrdersCount() {
  const tenant = await getTenant();
  if (!tenant) return 0;

  return tenant.db.serviceOrder.count();
}
