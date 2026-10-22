import type { Plan } from "@/generated/prisma/client";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";

export type BillingInterval = "monthly" | "yearly";

/** Valor mensal equivalente de um plano (anual dividido por 12), em reais. */
export function monthlyValue(plan: Plan, interval: string | null | undefined) {
  const info = subscriptionPlans.find((p) => p.slug === plan);
  if (!info) return 0;
  return interval === "yearly" ? info.price.yearly / 12 : info.price.monthly;
}

type ActiveSubscription = {
  plan: Plan;
  pendingInterval: string | null;
};

/** Receita mensal recorrente estimada das assinaturas ativas, em reais. */
export function computeMrr(subscriptions: ActiveSubscription[]) {
  const total = subscriptions.reduce(
    (sum, sub) => sum + monthlyValue(sub.plan, sub.pendingInterval),
    0,
  );
  return Math.round(total * 100) / 100;
}

/** Distribuição de assinaturas ativas por plano. */
export function countByPlan(subscriptions: { plan: Plan }[]) {
  const counts: Record<Plan, number> = { BASIC: 0, PLUS: 0, PROFESSIONAL: 0 };
  for (const sub of subscriptions) counts[sub.plan] += 1;
  return counts;
}

export const PAGE_SIZE = 20;

/** Normaliza o ?page= da URL (mínimo 1) e calcula o skip. */
export function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);
  const safe = Number.isFinite(page) && page > 0 ? page : 1;
  return { page: safe, skip: (safe - 1) * PAGE_SIZE, take: PAGE_SIZE };
}

export function totalPages(total: number) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}
