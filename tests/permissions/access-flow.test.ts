import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("@/lib/getSession", () => ({ getSession: vi.fn() }));
vi.mock("@/app/(auth)/dashboard/_data-access/get-subscription", () => ({
  getSubscription: vi.fn(),
}));
vi.mock("@/utils/permissions/canCreateBudget", () => ({
  canCreateBudget: vi.fn(async () => ({ hasPermission: true, planId: "BUDGET" })),
}));
vi.mock("@/utils/permissions/canCreateService", () => ({
  canCreateService: vi.fn(async () => ({ hasPermission: true, planId: "SERVICE" })),
}));

import { getSubscription } from "@/app/(auth)/dashboard/_data-access/get-subscription";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/getSession";
import { canPermission } from "@/utils/permissions/canPermission";
import { checkPermission } from "@/utils/permissions/check-permission";
import { checkSubscription } from "@/utils/permissions/checkSubscription";
import { checkSubscriptionExpired } from "@/utils/permissions/checkSubscriptionExpired";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const days = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

beforeEach(() => {
  resetPrismaMock();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("canPermission", () => {
  const authSession = vi.mocked(auth.api.getSession) as unknown as ReturnType<
    typeof vi.fn
  >;
  const expired = {
    hasPermission: false,
    planId: "EXPIRED",
    expired: true,
    plan: null,
  };

  it("sem sessão: bloqueia", async () => {
    authSession.mockResolvedValue(null);
    await expect(canPermission({ type: "budget" })).resolves.toEqual(expired);
  });

  it("delega orçamentos para canCreateBudget", async () => {
    authSession.mockResolvedValue({ user: { id: "u1" } });
    prismaMock.subscription.findFirst.mockResolvedValue(null);

    await expect(canPermission({ type: "budget" })).resolves.toMatchObject({
      planId: "BUDGET",
    });
    expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
  });

  it("delega ordens de serviço para canCreateService", async () => {
    authSession.mockResolvedValue({ user: { id: "u1" } });
    prismaMock.subscription.findFirst.mockResolvedValue(null);

    await expect(canPermission({ type: "service" })).resolves.toMatchObject({
      planId: "SERVICE",
    });
  });

  it("tipo desconhecido: bloqueia", async () => {
    authSession.mockResolvedValue({ user: { id: "u1" } });
    prismaMock.subscription.findFirst.mockResolvedValue(null);

    await expect(
      canPermission({ type: "outro" as never }),
    ).resolves.toEqual(expired);
  });
});

describe("checkPermission (rotas do dashboard)", () => {
  const user = (createdAt: Date, trialStartedAt: Date | null = null) => ({
    user: { id: "u1", createdAt, trialStartedAt },
  });

  it("sem sessão vai para a home", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    await expect(checkPermission("/dashboard/budget")).rejects.toThrow("REDIRECT:/");
  });

  it("plano Basic acessa orçamentos mas não estoque", async () => {
    vi.mocked(getSession).mockResolvedValue(user(days(-100)) as never);
    vi.mocked(getSubscription).mockResolvedValue({
      plan: "BASIC",
      status: "active",
    } as never);

    await expect(checkPermission("/dashboard/budget")).resolves.toBeUndefined();
    await expect(checkPermission("/dashboard/product")).rejects.toThrow(
      "REDIRECT:/dashboard?error=unauthorized",
    );
  });

  it("plano Plus acessa estoque e financeiro", async () => {
    vi.mocked(getSession).mockResolvedValue(user(days(-100)) as never);
    vi.mocked(getSubscription).mockResolvedValue({
      plan: "PLUS",
      status: "active",
    } as never);

    await expect(checkPermission("/dashboard/product")).resolves.toBeUndefined();
    await expect(checkPermission("/dashboard/financeiro")).resolves.toBeUndefined();
  });

  it("trial libera os módulos", async () => {
    vi.mocked(getSession).mockResolvedValue(user(days(-3)) as never);
    vi.mocked(getSubscription).mockResolvedValue(null);

    await expect(checkPermission("/dashboard/product")).resolves.toBeUndefined();
  });

  it("trial expirado bloqueia módulos, mas deixa planos e configurações", async () => {
    vi.mocked(getSession).mockResolvedValue(user(days(-30)) as never);
    vi.mocked(getSubscription).mockResolvedValue(null);

    await expect(checkPermission("/dashboard/budget")).rejects.toThrow("REDIRECT");
    for (const page of [
      "/dashboard",
      "/dashboard/plans",
      "/dashboard/config",
      "/dashboard/notifications",
    ]) {
      await expect(checkPermission(page)).resolves.toBeUndefined();
    }
  });

  it("meses de indicação liberam o plano Plus", async () => {
    vi.mocked(getSession).mockResolvedValue(user(days(-300)) as never);
    vi.mocked(getSubscription).mockResolvedValue({
      plan: "BASIC",
      status: null,
      bonusUntil: days(20),
      abacatepaySubscriptionId: null,
    } as never);

    await expect(checkPermission("/dashboard/product")).resolves.toBeUndefined();
  });
});

describe("checkSubscription", () => {
  it("usuário inexistente", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    await expect(checkSubscription("x")).resolves.toEqual({
      subscriptionStatus: "NONE",
      message: "Nenhuma assinatura encontrada",
      planId: "",
    });
  });

  it("assinatura ativa", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      createdAt: days(-100),
      subscription: { status: "active", plan: "PLUS" },
    });
    await expect(checkSubscription("u1")).resolves.toMatchObject({
      subscriptionStatus: "ACTIVE",
      planId: "PLUS",
    });
  });

  it("em teste informa os dias restantes", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      createdAt: days(-4),
      subscription: null,
    });
    await expect(checkSubscription("u1")).resolves.toEqual({
      subscriptionStatus: "TRIAL",
      message: "Você tem 10 dias de teste grátis!",
      planId: "TRIAL",
    });
  });

  it("usa trialStartedAt quando existe", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      createdAt: days(-60),
      trialStartedAt: days(-1),
      subscription: null,
    });
    await expect(checkSubscription("u1")).resolves.toMatchObject({
      subscriptionStatus: "TRIAL",
      message: "Você tem 13 dias de teste grátis!",
    });
  });

  it("trial vencido", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      createdAt: days(-20),
      subscription: null,
    });
    await expect(checkSubscription("u1")).resolves.toMatchObject({
      subscriptionStatus: "EXPIRED",
      planId: "TRIAL",
    });
  });
});

describe("checkSubscriptionExpired", () => {
  const sessionOf = (createdAt?: Date, trialStartedAt: Date | null = null) =>
    ({
      user: { id: "u1", email: "a@b.com", createdAt, trialStartedAt },
      session: { id: "s", userId: "u1" },
    }) as never;

  it("sem createdAt considera expirado", async () => {
    await expect(checkSubscriptionExpired(sessionOf(undefined))).resolves.toEqual({
      hasPermission: false,
      planId: "EXPIRED",
      expired: true,
      plan: null,
    });
  });

  it("dentro do trial libera", async () => {
    await expect(checkSubscriptionExpired(sessionOf(days(-5)))).resolves.toEqual({
      hasPermission: true,
      planId: "TRIAL",
      expired: false,
      plan: null,
    });
  });

  it("depois do trial bloqueia", async () => {
    const result = await checkSubscriptionExpired(sessionOf(days(-15)));
    expect(result.hasPermission).toBe(false);
    expect(result.expired).toBe(true);
  });

  it("respeita trialStartedAt", async () => {
    const result = await checkSubscriptionExpired(
      sessionOf(days(-100), days(-1)),
    );
    expect(result.hasPermission).toBe(true);
  });
});
