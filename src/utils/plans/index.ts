import { Plan } from "@/generated/prisma/client";
import type { PlanSlug } from "./types";

// Re-export types for server-side use
export type { PlanInfo, PlansProps } from "./types";
export type { PlanSlug };

// Re-export subscription plans (client-safe)
export { subscriptionPlans } from "./subscription-plans";

export const PLANS = {
  BASIC: {
    name: "Basic",
    maxServices: 20,
  },
  PLUS: {
    name: "Plus",
    maxServices: null,
  },
  PROFESSIONAL: {
    name: "Professional",
    maxServices: null,
  },
};
