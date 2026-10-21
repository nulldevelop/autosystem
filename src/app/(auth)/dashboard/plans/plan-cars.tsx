"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";
import type { PlanSlug } from "@/utils/plans/types";
import { createCheckout } from "./_actions/create-checkout";

type Interval = "monthly" | "yearly";

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function PlanCards() {
  const [billingInterval, setBillingInterval] = useState<Interval>("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planSlug: string) => {
    setLoading(planSlug);
    try {
      await createCheckout({
        planSlug: planSlug as PlanSlug,
        billingInterval,
      });
    } catch (error) {
      console.error("Erro ao selecionar plano:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Periodicidade"
        className="inline-flex gap-1 rounded-lg border bg-surface p-1"
      >
        {(
          [
            { value: "monthly", label: "Mensal" },
            { value: "yearly", label: "Anual" },
          ] as const
        ).map((o) => (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={billingInterval === o.value}
            onClick={() => setBillingInterval(o.value)}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors",
              billingInterval === o.value
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
            {o.value === "yearly" && <Badge variant="success">2 meses grátis</Badge>}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {subscriptionPlans.map((plan, index) => {
          const featured = index === 1;
          const price =
            billingInterval === "yearly"
              ? plan.price.yearly / 12
              : plan.price.monthly;
          return (
            <article
              key={plan.slug}
              className={cn(
                "relative flex flex-col rounded-xl border bg-card p-5",
                featured && "border-primary/50",
              )}
            >
              {featured && (
                <Badge className="absolute -top-2.5 left-5">
                  Mais escolhido
                </Badge>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>

              <div className="mt-4">
                {plan.oldPrice && (
                  <p className="num text-sm text-muted-foreground line-through">
                    {brl(plan.oldPrice.monthly)}
                  </p>
                )}
                <p className="flex items-baseline gap-1">
                  <span className="num font-display text-3xl font-semibold tracking-tight">
                    {brl(price)}
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </p>
                {billingInterval === "yearly" && (
                  <p className="num mt-1 text-sm text-primary">
                    {brl(plan.price.yearly)} cobrados por ano
                  </p>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full"
                size="lg"
                variant={featured ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.slug)}
                disabled={loading === plan.slug}
              >
                {loading === plan.slug ? "Processando…" : `Ativar ${plan.name}`}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
