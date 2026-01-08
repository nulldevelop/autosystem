import { addDays, isAfter } from "date-fns";
import { redirect } from "next/navigation";
import { getSubscription } from "@/app/(auth)/dashboard/_data-access/get-subscriptio";
import type { Plan } from "@/generated/prisma/client";
import { getSession } from "@/lib/getSession";
import { planRoutes } from "./plan-features";
import { TRIAL_DAYS } from "./trial-limits";

export async function checkPermission(page: string) {
  const session = await getSession();
  if (!session) {
    return redirect("/");
  }

  const subscription = await getSubscription(session.user.id);

  let userPlan: Plan | "TRIAL" | "EXPIRED" = "EXPIRED";
  let allowedRoutes: string[] = [];

  if (subscription && subscription.status === "active") {
    userPlan = subscription.plan;
    allowedRoutes = planRoutes[userPlan] || [];
  } else {
    const trialEndDate = addDays(new Date(session.user.createdAt), TRIAL_DAYS);
    if (isAfter(new Date(), trialEndDate)) {
      userPlan = "EXPIRED";
      allowedRoutes = [];
    } else {
      userPlan = "TRIAL";
      allowedRoutes = [
        "/dashboard/budget",
        "/dashboard/service",
        "/dashboard/customer",
        "/dashboard/vehicle",
        "/dashboard/product",
      ];
    }
  }

  if (!allowedRoutes.includes(page)) {
    return redirect("/dashboard?error=unauthorized");
  }
}
