import type { Subscription } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveAccess } from "@/utils/permissions/access";
import { checkSubscriptionExpired } from "@/utils/permissions/checkSubscriptionExpired";
import {
  TRIAL_BUDGET_LIMIT,
  TRIAL_SERVICES_LIMIT,
} from "@/utils/permissions/trial-limits";
import type { ResultPermissionProp } from "./canPermission";
import { getPlan, PLANS_LIMITS } from "./get-plans";

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

export async function canCreateBudget(
  subscription: Subscription | null,
  session: BetterAuthSession & {
    session?: { activeOrganizationId?: string | null };
  },
): Promise<ResultPermissionProp> {
  try {
    // Buscar organização ativa do usuário
    const activeOrgId = session.session?.activeOrganizationId;
    let organizationId = activeOrgId;

    if (!organizationId) {
      const member = await prisma.member.findFirst({
        where: {
          userId: session.user.id,
        },
        select: {
          organizationId: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      organizationId = member?.organizationId;
    }

    // Contar Budgets da organização
    const budgetCount = await prisma.budget.count({
      where: {
        organizationId: organizationId || undefined,
      },
    });

    const access = resolveAccess(session.user, subscription);

    if (access.plan) {
      const plan = access.plan;
      const planLimits = await getPlan(plan);

      return {
        hasPermission:
          planLimits.maxBudgets === null || budgetCount < planLimits.maxBudgets,
        planId: plan,
        expired: false,
        plan: PLANS_LIMITS[plan],
      };
    }

    const trialStatus = await checkSubscriptionExpired(session);

    if (!trialStatus.hasPermission) {
      return trialStatus;
    }

    return {
      ...trialStatus,
      hasPermission: budgetCount < TRIAL_BUDGET_LIMIT,
      plan: {
        maxBudgets: TRIAL_BUDGET_LIMIT,
        maxServices: TRIAL_SERVICES_LIMIT,
      },
    };
  } catch (error) {
    console.error("Error in canCreateBudget:", error);
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    };
  }
}
