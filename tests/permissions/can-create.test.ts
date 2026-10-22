import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));

import { canCreateBudget } from "@/utils/permissions/canCreateBudget";
import { canCreateService } from "@/utils/permissions/canCreateService";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const days = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

type Subscription = Parameters<typeof canCreateBudget>[0];
const subscription = (overrides: Record<string, unknown> = {}) =>
  ({
    plan: "BASIC",
    status: "active",
    currentPeriodEnd: null,
    bonusUntil: null,
    abacatepaySubscriptionId: "subs_1",
    ...overrides,
  }) as unknown as Subscription;

const session = (overrides: Record<string, unknown> = {}) => ({
  user: {
    id: "user-1",
    email: "a@b.com",
    createdAt: days(-1),
    trialStartedAt: null,
    ...overrides,
  },
  session: { id: "s1", userId: "user-1", activeOrganizationId: "org-A" },
});

const cases = [
  {
    name: "canCreateBudget",
    fn: canCreateBudget,
    countFn: () => prismaMock.budget.count,
    limitKey: "maxBudgets",
    trialLimit: 5,
  },
  {
    name: "canCreateService",
    fn: canCreateService,
    countFn: () => prismaMock.serviceOrder.count,
    limitKey: "maxServices",
    trialLimit: 5,
  },
] as const;

beforeEach(() => {
  resetPrismaMock();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
});

describe.each(cases)("$name", ({ fn, countFn, limitKey, trialLimit }) => {
  describe("assinatura ativa", () => {
    it("Basic abaixo do limite de 20 pode criar", async () => {
      countFn().mockResolvedValue(19);

      const result = await fn(subscription(), session());

      expect(result).toMatchObject({
        hasPermission: true,
        planId: "BASIC",
        expired: false,
      });
      expect(result.plan).toMatchObject({ [limitKey]: 20 });
    });

    it("Basic no limite de 20 não pode criar mais", async () => {
      countFn().mockResolvedValue(20);

      const result = await fn(subscription(), session());

      expect(result.hasPermission).toBe(false);
      expect(result.planId).toBe("BASIC");
    });

    it.each(["PLUS", "PROFESSIONAL"] as const)("%s é ilimitado", async (plan) => {
      countFn().mockResolvedValue(100_000);

      const result = await fn(subscription({ plan }), session());

      expect(result).toMatchObject({ hasPermission: true, planId: plan });
      expect(result.plan).toMatchObject({ [limitKey]: null });
    });
  });

  describe("meses grátis de indicação", () => {
    it("quem nunca pagou ganha limites do Plus (ilimitado)", async () => {
      countFn().mockResolvedValue(500);

      const result = await fn(
        subscription({
          status: null,
          plan: "BASIC",
          abacatepaySubscriptionId: null,
          bonusUntil: days(30),
        }),
        session({ createdAt: days(-200) }),
      );

      expect(result).toMatchObject({ hasPermission: true, planId: "PLUS" });
    });

    it("bônus vencido volta a depender do trial", async () => {
      countFn().mockResolvedValue(0);

      const result = await fn(
        subscription({ status: null, bonusUntil: days(-1) }),
        session({ createdAt: days(-200) }),
      );

      expect(result).toMatchObject({ hasPermission: false, planId: "EXPIRED" });
    });
  });

  describe("teste grátis", () => {
    it(`abaixo do limite de ${trialLimit} pode criar`, async () => {
      countFn().mockResolvedValue(trialLimit - 1);

      const result = await fn(null, session());

      expect(result).toMatchObject({
        hasPermission: true,
        planId: "TRIAL",
        expired: false,
        plan: { maxBudgets: 5, maxServices: 5 },
      });
    });

    it(`no limite de ${trialLimit} não pode criar`, async () => {
      countFn().mockResolvedValue(trialLimit);

      const result = await fn(null, session());

      expect(result.hasPermission).toBe(false);
      expect(result.planId).toBe("TRIAL");
    });

    it("conta os 14 dias a partir de trialStartedAt", async () => {
      countFn().mockResolvedValue(0);

      const result = await fn(
        null,
        session({ createdAt: days(-60), trialStartedAt: days(-2) }),
      );

      expect(result).toMatchObject({ hasPermission: true, planId: "TRIAL" });
    });

    it("trial vencido bloqueia tudo", async () => {
      countFn().mockResolvedValue(0);

      const result = await fn(null, session({ createdAt: days(-15) }));

      expect(result).toEqual({
        hasPermission: false,
        planId: "EXPIRED",
        expired: true,
        plan: null,
      });
    });

    it("assinatura cancelada sem trial também bloqueia", async () => {
      countFn().mockResolvedValue(0);

      const result = await fn(
        subscription({ status: "canceled" }),
        session({ createdAt: days(-90) }),
      );

      expect(result.expired).toBe(true);
    });
  });

  describe("oficina", () => {
    it("usa a oficina ativa da sessão", async () => {
      countFn().mockResolvedValue(0);

      await fn(subscription({ plan: "PLUS" }), session());

      expect(prismaMock.member.findFirst).not.toHaveBeenCalled();
      const where = countFn().mock.calls[0][0].where;
      expect(where.organizationId).toBe("org-A");
    });

    it("sem oficina ativa cai para a primeira oficina do usuário", async () => {
      prismaMock.member.findFirst.mockResolvedValue({ organizationId: "org-first" });
      countFn().mockResolvedValue(0);

      await fn(subscription({ plan: "PLUS" }), {
        ...session(),
        session: { id: "s1", userId: "user-1", activeOrganizationId: null },
      });

      expect(prismaMock.member.findFirst).toHaveBeenCalled();
      expect(countFn().mock.calls[0][0].where.organizationId).toBe("org-first");
    });
  });

  it("erro inesperado bloqueia por segurança", async () => {
    countFn().mockRejectedValue(new Error("db"));

    const result = await fn(subscription(), session());

    expect(result).toEqual({
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    });
  });
});

describe("canCreateService", () => {
  it("não conta ordens canceladas no limite", async () => {
    prismaMock.serviceOrder.count.mockResolvedValue(0);

    await canCreateService(subscription(), session());

    expect(prismaMock.serviceOrder.count).toHaveBeenCalledWith({
      where: { organizationId: "org-A", status: { not: "canceled" } },
    });
  });
});
