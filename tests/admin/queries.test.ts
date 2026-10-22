import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));

import { writeAudit } from "@/lib/admin/audit";
import {
  SUBSCRIPTION_FILTERS,
  getOrganizationDetail,
  getOverview,
  listAuditLogs,
  listBillingEvents,
  listOrganizations,
  listSubscriptions,
  listUsers,
  parseSubscriptionFilter,
} from "@/lib/admin/queries";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const paging = { skip: 0, take: 20 };

beforeEach(() => {
  resetPrismaMock();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

describe("getOverview", () => {
  beforeEach(() => {
    prismaMock.user.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(3) // novos 30d
      .mockResolvedValueOnce(4) // em teste
      .mockResolvedValueOnce(1) // bloqueados
      .mockResolvedValueOnce(6) // indicados
      .mockResolvedValueOnce(2); // recompensados
    prismaMock.organization.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(2);
    prismaMock.subscription.findMany.mockResolvedValue([
      { plan: "BASIC", pendingInterval: "monthly" },
      { plan: "PLUS", pendingInterval: "monthly" },
    ]);
    prismaMock.subscription.count.mockResolvedValue(7);
    prismaMock.billingEvent.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 23998 } })
      .mockResolvedValueOnce({ _sum: { amount: 99999 } });
    prismaMock.user.findMany.mockResolvedValue([{ id: "u1" }]);
    prismaMock.billingEvent.findMany.mockResolvedValue([{ id: "e1" }]);
  });

  it("consolida os indicadores", async () => {
    const data = await getOverview();

    expect(data).toMatchObject({
      totalUsers: 10,
      newUsers30: 3,
      totalOrganizations: 5,
      newOrganizations30: 2,
      activeCount: 2,
      trialUsers: 4,
      bonusUsers: 7,
      blockedUsers: 1,
      referredUsers: 6,
      rewardedUsers: 2,
      revenue30Cents: 23998,
      revenueTotalCents: 99999,
    });
    expect(data.byPlan).toEqual({ BASIC: 1, PLUS: 1, PROFESSIONAL: 0 });
    expect(data.mrr).toBe(199.98);
    expect(data.recentUsers).toEqual([{ id: "u1" }]);
    expect(data.recentEvents).toEqual([{ id: "e1" }]);
  });

  it("receita só soma novas assinaturas e renovações", async () => {
    await getOverview();

    for (const [args] of prismaMock.billingEvent.aggregate.mock.calls) {
      expect(args.where.type).toEqual({ in: ["completed", "renewed"] });
    }
  });

  it("receita sem eventos vira zero", async () => {
    prismaMock.billingEvent.aggregate.mockReset();
    prismaMock.billingEvent.aggregate.mockResolvedValue({ _sum: { amount: null } });

    const data = await getOverview();

    expect(data.revenue30Cents).toBe(0);
    expect(data.revenueTotalCents).toBe(0);
  });

  it("teste grátis conta quem não é assinante ativo e está dentro dos 14 dias", async () => {
    await getOverview();

    const trialWhere = prismaMock.user.count.mock.calls[2][0].where;
    const cutoff = new Date("2026-10-08T12:00:00.000Z");
    expect(trialWhere.AND[0].OR).toEqual([
      { trialStartedAt: { gt: cutoff } },
      { trialStartedAt: null, createdAt: { gt: cutoff } },
    ]);
  });
});

describe("listOrganizations", () => {
  it("sem busca lista tudo, da mais nova para a mais antiga", async () => {
    prismaMock.organization.findMany.mockResolvedValue([{ id: "o1" }]);
    prismaMock.organization.count.mockResolvedValue(1);

    const result = await listOrganizations({ ...paging });

    expect(result).toEqual({ items: [{ id: "o1" }], total: 1 });
    expect(prismaMock.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
      }),
    );
  });

  it("busca por nome, slug, CNPJ e e-mail de membro (sem diferenciar maiúsculas)", async () => {
    prismaMock.organization.findMany.mockResolvedValue([]);
    prismaMock.organization.count.mockResolvedValue(0);

    await listOrganizations({ ...paging, q: "  Auto  " });

    const where = prismaMock.organization.findMany.mock.calls[0][0].where;
    expect(where.OR).toHaveLength(4);
    expect(where.OR[0]).toEqual({ name: { contains: "Auto", mode: "insensitive" } });
    expect(where.OR[2]).toEqual({ cnpj: { contains: "Auto" } });
    expect(where.OR[3].members.some.user.email.mode).toBe("insensitive");
    expect(prismaMock.organization.count).toHaveBeenCalledWith({ where });
  });

  it("busca só com espaços é ignorada", async () => {
    prismaMock.organization.findMany.mockResolvedValue([]);
    prismaMock.organization.count.mockResolvedValue(0);

    await listOrganizations({ ...paging, q: "   " });

    expect(prismaMock.organization.findMany.mock.calls[0][0].where).toEqual({});
  });
});

describe("getOrganizationDetail", () => {
  it("oficina inexistente: null", async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);
    await expect(getOrganizationDetail("x")).resolves.toBeNull();
    expect(prismaMock.transaction.aggregate).not.toHaveBeenCalled();
  });

  it("junta faturamento pago e últimos orçamentos da própria oficina", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: "o1", name: "X" });
    prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { amount: 1500 } });
    prismaMock.budget.findMany.mockResolvedValue([{ id: "b1" }]);

    const detail = await getOrganizationDetail("o1");

    expect(detail).toEqual({
      organization: { id: "o1", name: "X" },
      paidIncome: 1500,
      recentBudgets: [{ id: "b1" }],
    });
    expect(prismaMock.transaction.aggregate.mock.calls[0][0].where).toEqual({
      organizationId: "o1",
      type: "INCOME",
      status: "PAID",
    });
    expect(prismaMock.budget.findMany.mock.calls[0][0].where).toEqual({
      organizationId: "o1",
    });
  });

  it("sem receita o faturamento é zero", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: "o1" });
    prismaMock.transaction.aggregate.mockResolvedValue({ _sum: { amount: null } });
    prismaMock.budget.findMany.mockResolvedValue([]);

    await expect(getOrganizationDetail("o1")).resolves.toMatchObject({
      paidIncome: 0,
    });
  });
});

describe("listUsers", () => {
  it("busca por e-mail ou nome", async () => {
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.user.count.mockResolvedValue(0);

    await listUsers({ ...paging, q: "ana" });

    expect(prismaMock.user.findMany.mock.calls[0][0].where.OR).toEqual([
      { email: { contains: "ana", mode: "insensitive" } },
      { name: { contains: "ana", mode: "insensitive" } },
    ]);
  });

  it("sem busca lista todos", async () => {
    prismaMock.user.findMany.mockResolvedValue([{ id: "u1" }]);
    prismaMock.user.count.mockResolvedValue(1);

    await expect(listUsers({ ...paging })).resolves.toEqual({
      items: [{ id: "u1" }],
      total: 1,
    });
    expect(prismaMock.user.findMany.mock.calls[0][0].where).toEqual({});
  });
});

describe("assinaturas: filtros", () => {
  it.each([
    ["all", {}],
    ["active", { status: "active" }],
    ["canceled", { status: "canceled" }],
    ["bonus", { bonusUntil: { gt: NOW } }],
  ] as const)("filtro %s", async (filter, where) => {
    prismaMock.subscription.findMany.mockResolvedValue([]);
    prismaMock.subscription.count.mockResolvedValue(0);

    await listSubscriptions({ ...paging, filter });

    expect(prismaMock.subscription.findMany.mock.calls[0][0].where).toEqual(where);
    expect(prismaMock.subscription.count).toHaveBeenCalledWith({ where });
  });

  it("parseSubscriptionFilter aceita só valores conhecidos", () => {
    for (const filter of SUBSCRIPTION_FILTERS) {
      expect(parseSubscriptionFilter(filter)).toBe(filter);
    }
    expect(parseSubscriptionFilter("hack")).toBe("all");
    expect(parseSubscriptionFilter(undefined)).toBe("all");
    expect(parseSubscriptionFilter(["bonus", "active"])).toBe("bonus");
  });
});

describe("pagamentos e auditoria", () => {
  it("anexa o e-mail de quem pagou, sem consultar usuários repetidos", async () => {
    prismaMock.billingEvent.findMany.mockResolvedValue([
      { id: "e1", userId: "u1" },
      { id: "e2", userId: "u1" },
      { id: "e3", userId: null },
      { id: "e4", userId: "sumiu" },
    ]);
    prismaMock.billingEvent.count.mockResolvedValue(4);
    prismaMock.user.findMany.mockResolvedValue([
      { id: "u1", email: "ana@x.com", name: "Ana" },
    ]);

    const { items, total } = await listBillingEvents({ ...paging });

    expect(total).toBe(4);
    expect(items[0].user).toEqual({ email: "ana@x.com", name: "Ana" });
    expect(items[2].user).toBeNull();
    expect(items[3].user).toBeNull();
    expect(prismaMock.user.findMany.mock.calls[0][0].where).toEqual({
      id: { in: ["u1", "sumiu"] },
    });
  });

  it("sem eventos não consulta usuários", async () => {
    prismaMock.billingEvent.findMany.mockResolvedValue([]);
    prismaMock.billingEvent.count.mockResolvedValue(0);

    await expect(listBillingEvents({ ...paging })).resolves.toEqual({
      items: [],
      total: 0,
    });
    expect(prismaMock.user.findMany).not.toHaveBeenCalled();
  });

  it("auditoria anexa o administrador", async () => {
    prismaMock.adminAuditLog.findMany.mockResolvedValue([
      { id: "l1", adminId: "a1" },
      { id: "l2", adminId: "a2" },
    ]);
    prismaMock.adminAuditLog.count.mockResolvedValue(2);
    prismaMock.user.findMany.mockResolvedValue([
      { id: "a1", email: "admin@x.com", name: null },
    ]);

    const { items } = await listAuditLogs({ ...paging });

    expect(items[0].admin).toEqual({ email: "admin@x.com", name: null });
    expect(items[1].admin).toBeNull();
  });
});

describe("writeAudit", () => {
  it("grava a ação com o administrador, o alvo e os detalhes", async () => {
    const entry = {
      adminId: "a1",
      action: "BLOCK_USER" as const,
      targetType: "user" as const,
      targetId: "u1",
      details: { email: "x@y.com" },
    };

    await writeAudit(entry);

    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith({ data: entry });
  });
});
