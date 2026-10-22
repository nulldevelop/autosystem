import { redirect } from "next/navigation";
import { getSubscription } from "@/app/(auth)/dashboard/_data-access/get-subscription";
import type { Plan } from "@/generated/prisma/client";
import { getSession } from "@/lib/getSession";
import { planRoutes, trialRoutes } from "./plan-features";
import { resolveAccess } from "./access";

export async function checkPermission(page: string) {
  const session = await getSession();
  if (!session) {
    return redirect("/");
  }

  const subscription = await getSubscription(session.user.id);

  let userPlan: Plan | "TRIAL" | "EXPIRED" = "EXPIRED";
  let allowedRoutes: string[] = [];

  const access = resolveAccess(session.user, subscription);
  if (access.plan) {
    userPlan = access.plan;
    allowedRoutes = planRoutes[access.plan] || [];
  } else if (access.kind === "TRIAL") {
    userPlan = "TRIAL";
    allowedRoutes = trialRoutes;
  }

  // Rotas que todos podem acessar no dashboard
  const publicDashboardRoutes = ["/dashboard", "/dashboard/config", "/dashboard/plans", "/dashboard/notifications"];

  if (!allowedRoutes.includes(page) && !publicDashboardRoutes.includes(page)) {
    return redirect("/dashboard?error=unauthorized");
  }
}
