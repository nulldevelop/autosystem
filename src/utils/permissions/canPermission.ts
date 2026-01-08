"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCreateBudget } from "./canCreateBudget";
import { canCreateService } from "./canCreateService";
import type { PlanDetailInfo } from "./get-plans";

export type PLAN_PROP = "BASIC" | "PLUS" | "PROFESSIONAL" | "TRIAL" | "EXPIRED";
type TypeCheck = "service" | "budget";

export interface ResultPermissionProp {
  hasPermission: boolean;
  planId: PLAN_PROP;
  expired: boolean;
  plan: PlanDetailInfo | null;
}

interface CanPermissionProps {
  type: TypeCheck;
}

export async function canPermission({
  type,
}: CanPermissionProps): Promise<ResultPermissionProp> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    };
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  switch (type) {
    case "service": {
      const permission = await canCreateService(subscription, session);

      return permission;
    }

    case "budget": {
      const permission = await canCreateBudget(subscription, session);

      return permission;
    }

    default:
      return {
        hasPermission: false,
        planId: "EXPIRED",
        expired: true,
        plan: null,
      };
  }
}
