import { subDays } from "date-fns";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits";
import { computeMrr, countByPlan } from "./metrics";

/**
 * Consultas do painel administrativo.
 *
 * ATENÇÃO: estas consultas atravessam todas as oficinas de propósito. Só devem ser
 * importadas por páginas/ações que chamam requireAdmin()/requireAdminPage() antes.
 */

type Paging = { skip: number; take: number };

const NOT_ACTIVE: Prisma.SubscriptionWhereInput = {
  OR: [{ status: null }, { status: { not: "active" } }],
};

export async function getOverview() {
  const now = new Date();
  const trialCutoff = subDays(now, TRIAL_DAYS);
  const since30 = subDays(now, 30);
  const paid = { type: { in: ["completed", "renewed"] } };

  const [
    totalUsers,
    newUsers30,
    totalOrganizations,
    newOrganizations30,
    activeSubscriptions,
    trialUsers,
    bonusUsers,
    blockedUsers,
    referredUsers,
    rewardedUsers,
    revenue30,
    revenueTotal,
    recentUsers,
    recentEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since30 } } }),
    prisma.organization.count(),
    prisma.organization.count({ where: { createdAt: { gte: since30 } } }),
    prisma.subscription.findMany({
      where: { status: "active" },
      select: { plan: true, pendingInterval: true },
    }),
    prisma.user.count({
      where: {
        AND: [
          {
            OR: [
              { trialStartedAt: { gt: trialCutoff } },
              { trialStartedAt: null, createdAt: { gt: trialCutoff } },
            ],
          },
          {
            OR: [
              { subscription: { is: null } },
              { subscription: { is: NOT_ACTIVE } },
            ],
          },
        ],
      },
    }),
    prisma.subscription.count({
      where: { bonusUntil: { gt: now }, ...NOT_ACTIVE },
    }),
    prisma.user.count({ where: { blockedAt: { not: null } } }),
    prisma.user.count({ where: { referredById: { not: null } } }),
    prisma.user.count({ where: { referralRewardedAt: { not: null } } }),
    prisma.billingEvent.aggregate({
      _sum: { amount: true },
      where: { ...paid, createdAt: { gte: since30 } },
    }),
    prisma.billingEvent.aggregate({ _sum: { amount: true }, where: paid }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.billingEvent.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return {
    totalUsers,
    newUsers30,
    totalOrganizations,
    newOrganizations30,
    activeCount: activeSubscriptions.length,
    byPlan: countByPlan(activeSubscriptions),
    mrr: computeMrr(activeSubscriptions),
    trialUsers,
    bonusUsers,
    blockedUsers,
    referredUsers,
    rewardedUsers,
    revenue30Cents: revenue30._sum.amount ?? 0,
    revenueTotalCents: revenueTotal._sum.amount ?? 0,
    recentUsers,
    recentEvents,
  };
}

export async function listOrganizations({
  q,
  skip,
  take,
}: Paging & { q?: string }) {
  const term = q?.trim();
  const where: Prisma.OrganizationWhereInput = term
    ? {
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { slug: { contains: term, mode: "insensitive" } },
          { cnpj: { contains: term } },
          {
            members: {
              some: {
                user: { email: { contains: term, mode: "insensitive" } },
              },
            },
          },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        members: {
          where: { role: "owner" },
          take: 1,
          include: { user: { include: { subscription: true } } },
        },
        _count: {
          select: {
            customers: true,
            vehicles: true,
            budgets: true,
            serviceOrders: true,
          },
        },
      },
    }),
    prisma.organization.count({ where }),
  ]);

  return { items, total };
}

export async function getOrganizationDetail(id: string) {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: { include: { user: { include: { subscription: true } } } },
      _count: {
        select: {
          customers: true,
          vehicles: true,
          budgets: true,
          serviceOrders: true,
          products: true,
        },
      },
    },
  });
  if (!organization) return null;

  const [income, recentBudgets] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { organizationId: id, type: "INCOME", status: "PAID" },
    }),
    prisma.budget.findMany({
      where: { organizationId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, totalAmount: true, status: true, createdAt: true },
    }),
  ]);

  return {
    organization,
    paidIncome: income._sum.amount ?? 0,
    recentBudgets,
  };
}

export async function listUsers({ q, skip, take }: Paging & { q?: string }) {
  const term = q?.trim();
  const where: Prisma.UserWhereInput = term
    ? {
        OR: [
          { email: { contains: term, mode: "insensitive" } },
          { name: { contains: term, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        subscription: true,
        members: {
          take: 1,
          include: { organization: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}

export const SUBSCRIPTION_FILTERS = [
  "all",
  "active",
  "canceled",
  "bonus",
] as const;
export type SubscriptionFilter = (typeof SUBSCRIPTION_FILTERS)[number];

export function parseSubscriptionFilter(
  value: string | string[] | undefined,
): SubscriptionFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return SUBSCRIPTION_FILTERS.find((f) => f === raw) ?? "all";
}

export async function listSubscriptions({
  filter,
  skip,
  take,
}: Paging & { filter: SubscriptionFilter }) {
  const now = new Date();
  const where: Prisma.SubscriptionWhereInput =
    filter === "active"
      ? { status: "active" }
      : filter === "canceled"
        ? { status: "canceled" }
        : filter === "bonus"
          ? { bonusUntil: { gt: now } }
          : {};

  const [items, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.subscription.count({ where }),
  ]);

  return { items, total };
}

async function emailsByUserId(ids: (string | null)[]) {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map<string, { email: string; name: string | null }>();

  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, email: true, name: true },
  });
  return new Map(users.map((u) => [u.id, { email: u.email, name: u.name }]));
}

export async function listBillingEvents({ skip, take }: Paging) {
  const [events, total] = await Promise.all([
    prisma.billingEvent.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.billingEvent.count(),
  ]);

  const users = await emailsByUserId(events.map((e) => e.userId));
  return {
    items: events.map((e) => ({
      ...e,
      user: e.userId ? (users.get(e.userId) ?? null) : null,
    })),
    total,
  };
}

export async function listAuditLogs({ skip, take }: Paging) {
  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.adminAuditLog.count(),
  ]);

  const admins = await emailsByUserId(logs.map((l) => l.adminId));
  return {
    items: logs.map((l) => ({ ...l, admin: admins.get(l.adminId) ?? null })),
    total,
  };
}
