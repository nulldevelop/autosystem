import type { Plan } from "@/generated/prisma/client";

// Defines the routes accessible for each paid subscription plan.
export const planRoutes: Record<Plan, string[]> = {
  BASIC: [
    "/dashboard/budget",
    "/dashboard/service",
    "/dashboard/customer",
    "/dashboard/vehicle",
    "/dashboard/relatorios",
  ],
  PLUS: [
    "/dashboard/budget",
    "/dashboard/service",
    "/dashboard/customer",
    "/dashboard/vehicle",
    "/dashboard/product", // Unlocks Stock module
    "/dashboard/relatorios",
  ],
  PROFESSIONAL: [
    "/dashboard/budget",
    "/dashboard/service",
    "/dashboard/customer",
    "/dashboard/vehicle",
    "/dashboard/product", // Unlocks Stock module
    "/dashboard/financeiro", // Unlocks Financial module
    "/dashboard/relatorios",
  ],
};

// Defines the routes accessible during the trial period.
export const trialRoutes: string[] = [
  "/dashboard/budget",
  "/dashboard/service",
  "/dashboard/customer",
  "/dashboard/vehicle",
  "/dashboard/product",
  "/dashboard/financeiro",
  "/dashboard/relatorios",
];
