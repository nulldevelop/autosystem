import type { Plan } from "@/generated/prisma/client";

// Defines the routes accessible for each paid subscription plan.
export const planRoutes: Record<Plan, string[]> = {
  BASIC: [
    "/dashboard/budget",
    "/dashboard/service",
    "/dashboard/customer",
    "/dashboard/vehicle",
  ],
  PLUS: [
    "/dashboard/budget",
    "/dashboard/service",
    "/dashboard/customer",
    "/dashboard/vehicle",
    "/dashboard/product", // Unlocks Stock module
  ],
  PROFESSIONAL: [
    "/dashboard/budget",
    "/dashboard/service",
    "/dashboard/customer",
    "/dashboard/vehicle",
    "/dashboard/product", // Unlocks Stock module
    "/dashboard/financeiro", // Unlocks Financial module
  ],
};

// Defines the routes accessible during the trial period.
export const trialRoutes: string[] = [
  "/dashboard/budget",
  "/dashboard/service",
  "/dashboard/customer",
  "/dashboard/vehicle",
  "/dashboard/product",
];
