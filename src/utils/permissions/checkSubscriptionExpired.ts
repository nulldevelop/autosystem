"use server";

import { addDays, isAfter } from "date-fns";
import type { ResultPermissionProp } from "./canPermission";
import { TRIAL_DAYS } from "./trial-limits";

type BetterAuthSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    createdAt: Date;
  };
  session: {
    id: string;
    userId: string;
  };
};

export async function checkSubscriptionExpired(
  session: BetterAuthSession,
): Promise<ResultPermissionProp> {
  if (!session?.user?.createdAt) {
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    };
  }

  const trialEndDate = addDays(new Date(session.user.createdAt), TRIAL_DAYS);

  if (isAfter(new Date(), trialEndDate)) {
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    };
  }

  return {
    hasPermission: true,
    planId: "TRIAL",
    expired: false,
    plan: null,
  };
}
