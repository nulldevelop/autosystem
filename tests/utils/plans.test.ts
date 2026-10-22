import { describe, expect, it } from "vitest";
import { PLANS, subscriptionPlans } from "@/utils/plans";
import { PLANS_LIMITS, getPlan } from "@/utils/permissions/get-plans";
import { planRoutes, trialRoutes } from "@/utils/permissions/plan-features";
import {
  TRIAL_BUDGET_LIMIT,
  TRIAL_DAYS,
  TRIAL_SERVICES_LIMIT,
} from "@/utils/permissions/trial-limits";

describe("trial", () => {
  it("o teste grátis dura 14 dias", () => {
    expect(TRIAL_DAYS).toBe(14);
  });

  it("limites do trial são positivos", () => {
    expect(TRIAL_BUDGET_LIMIT).toBeGreaterThan(0);
    expect(TRIAL_SERVICES_LIMIT).toBeGreaterThan(0);
  });
});

describe("subscriptionPlans", () => {
  it("tem Basic, Plus e Professional, nessa ordem", () => {
    expect(subscriptionPlans.map((p) => p.slug)).toEqual([
      "BASIC",
      "PLUS",
      "PROFESSIONAL",
    ]);
  });

  it.each(subscriptionPlans)("$name: anual custa 10 mensalidades", (plan) => {
    expect(plan.price.yearly).toBeCloseTo(plan.price.monthly * 10, 1);
  });

  it("não expõe mais IDs de preço do Stripe", () => {
    for (const plan of subscriptionPlans) {
      expect(plan).not.toHaveProperty("priceIds");
    }
  });

  it("mantém os preços mensais combinados", () => {
    const monthly = Object.fromEntries(
      subscriptionPlans.map((p) => [p.slug, p.price.monthly]),
    );
    expect(monthly).toEqual({ BASIC: 79.99, PLUS: 119.99, PROFESSIONAL: 179.99 });
  });

  it("cada plano lista benefícios", () => {
    for (const plan of subscriptionPlans) {
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });
});

describe("limites por plano", () => {
  it("PLANS e PLANS_LIMITS concordam sobre ordens de serviço", () => {
    for (const slug of ["BASIC", "PLUS", "PROFESSIONAL"] as const) {
      expect(PLANS[slug].maxServices).toBe(PLANS_LIMITS[slug].maxServices);
    }
  });

  it("Basic é limitado e os demais são ilimitados", () => {
    expect(PLANS_LIMITS.BASIC).toEqual({ maxServices: 20, maxBudgets: 20 });
    expect(PLANS_LIMITS.PLUS).toEqual({ maxServices: null, maxBudgets: null });
    expect(PLANS_LIMITS.PROFESSIONAL).toEqual({
      maxServices: null,
      maxBudgets: null,
    });
  });

  it("getPlan devolve os limites do plano", async () => {
    await expect(getPlan("BASIC")).resolves.toEqual(PLANS_LIMITS.BASIC);
    await expect(getPlan("PLUS")).resolves.toEqual(PLANS_LIMITS.PLUS);
  });
});

describe("rotas liberadas por plano", () => {
  it("Basic não libera estoque nem financeiro", () => {
    expect(planRoutes.BASIC).not.toContain("/dashboard/product");
    expect(planRoutes.BASIC).not.toContain("/dashboard/financeiro");
  });

  it("Plus e Professional liberam estoque e financeiro", () => {
    for (const plan of ["PLUS", "PROFESSIONAL"] as const) {
      expect(planRoutes[plan]).toContain("/dashboard/product");
      expect(planRoutes[plan]).toContain("/dashboard/financeiro");
    }
  });

  it("todo plano libera o básico da oficina", () => {
    for (const routes of Object.values(planRoutes)) {
      for (const route of [
        "/dashboard/budget",
        "/dashboard/service",
        "/dashboard/customer",
        "/dashboard/vehicle",
      ]) {
        expect(routes).toContain(route);
      }
    }
  });

  it("o trial libera todos os módulos", () => {
    expect(trialRoutes).toEqual(
      expect.arrayContaining([
        "/dashboard/product",
        "/dashboard/financeiro",
        "/dashboard/relatorios",
      ]),
    );
  });
});
