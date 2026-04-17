"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";

export async function checkOrganization() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  const hasOrg = !!session.session.activeOrganizationId;

  return {
    hasOrg,
    orgId: session.session.activeOrganizationId,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
}
