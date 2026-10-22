import { addDays, isAfter } from "date-fns";
import type { ResultPermissionProp } from "./canPermission";
import { getTrialStart } from "./access";
import { TRIAL_DAYS } from "./trial-limits";

type BetterAuthSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    createdAt: Date;
    trialStartedAt?: Date | null;
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

  const trialEndDate = addDays(getTrialStart(session.user), TRIAL_DAYS);

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
