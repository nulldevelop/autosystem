import { addDays, isAfter } from "date-fns";
import type { Plan, Subscription } from "@/generated/prisma/client";
import { TRIAL_DAYS } from "./trial-limits";

export type AccessKind = "ACTIVE" | "BONUS" | "TRIAL" | "EXPIRED";

export type Access = {
  kind: AccessKind;
  /** Plano que define rotas e limites. null em TRIAL/EXPIRED. */
  plan: Plan | null;
  /** Fim do período vigente (trial, bônus ou ciclo pago). */
  endsAt: Date | null;
};

export type TrialUser = {
  createdAt: Date | string;
  trialStartedAt?: Date | string | null;
};

/** O teste grátis conta a partir da confirmação do e-mail; antes disso, do cadastro. */
export function getTrialStart(user: TrialUser) {
  return new Date(user.trialStartedAt ?? user.createdAt);
}

type SubscriptionAccessFields = Pick<
  Subscription,
  "plan" | "status" | "currentPeriodEnd" | "bonusUntil" | "abacatepaySubscriptionId"
>;

/**
 * Fonte única para decidir o acesso do usuário:
 * assinatura paga > meses grátis de indicação > trial de TRIAL_DAYS > expirado.
 */
export function resolveAccess(
  user: TrialUser,
  subscription: SubscriptionAccessFields | null | undefined,
  now: Date = new Date(),
): Access {
  if (subscription?.status === "active") {
    return {
      kind: "ACTIVE",
      plan: subscription.plan,
      endsAt: subscription.currentPeriodEnd,
    };
  }

  if (subscription?.bonusUntil && isAfter(subscription.bonusUntil, now)) {
    return {
      kind: "BONUS",
      // quem nunca pagou ganha o plano Plus durante os meses de brinde
      plan: subscription.abacatepaySubscriptionId
        ? subscription.plan
        : "PLUS",
      endsAt: subscription.bonusUntil,
    };
  }

  const trialEnd = addDays(getTrialStart(user), TRIAL_DAYS);
  if (isAfter(trialEnd, now)) {
    return { kind: "TRIAL", plan: null, endsAt: trialEnd };
  }

  return { kind: "EXPIRED", plan: null, endsAt: trialEnd };
}
