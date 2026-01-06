"use server";

import type { Plan } from "@/generated/prisma/client";

export interface PlanDetailInfo {
  maxServices: number | null;
  maxBudgets: number | null;
}

export type PlansProps = {
  [key in Plan]: PlanDetailInfo;
};

export const PLANS_LIMITS: PlansProps = {
  BASIC: {
    maxServices: 20, // Conforme definido em utils/plans/index.ts
    maxBudgets: 20, // Limite de orçamentos para plano Basic
  },
  PLUS: {
    maxServices: null, // Ilimitado
    maxBudgets: null, // Ilimitado
  },
  PROFESSIONAL: {
    maxServices: null, // Ilimitado
    maxBudgets: null, // Ilimitado
  },
};

export async function getPlan(planId: Plan): Promise<PlanDetailInfo> {
  return PLANS_LIMITS[planId];
}
