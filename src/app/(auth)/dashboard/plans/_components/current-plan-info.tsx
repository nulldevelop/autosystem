"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CreditCard, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CurrentPlanInfoProps {
  // biome-ignore lint/suspicious/noExplicitAny: formato da assinatura vem do Stripe/Prisma
  subscription: any;
}

export function CurrentPlanInfo({ subscription }: CurrentPlanInfoProps) {
  if (!subscription) return null;

  const nextPayment = subscription.stripeCurrentPeriodEnd
    ? new Date(subscription.stripeCurrentPeriodEnd)
    : null;
  const amount = subscription.planDetails?.price.monthly || 0;
  const isActive = subscription.status === "active";

  return (
    <section
      aria-label="Plano atual"
      className="rounded-xl border border-primary/30 bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <ShieldCheck className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Seu plano atual</p>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {subscription.planDetails?.name || subscription.plan}
            </h2>
            <Badge variant={isActive ? "success" : "warning"}>
              {isActive ? "Ativo" : "Período de teste"}
            </Badge>
          </div>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Calendar
            className="mt-0.5 size-4 text-muted-foreground"
            aria-hidden
          />
          <div>
            <dt className="text-sm text-muted-foreground">
              Próximo vencimento
            </dt>
            <dd className="font-medium">
              {nextPayment
                ? format(nextPayment, "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })
                : "Sem cobrança agendada"}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CreditCard
            className="mt-0.5 size-4 text-muted-foreground"
            aria-hidden
          />
          <div>
            <dt className="text-sm text-muted-foreground">Valor mensal</dt>
            <dd className="num font-medium">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(amount)}
            </dd>
          </div>
        </div>
      </dl>
    </section>
  );
}
