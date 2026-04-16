"use client";

import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";
import type { PlanSlug } from "@/utils/plans/types";
import { createCheckout } from "./_actions/create-checkout";

export function PlanCards() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly",
  );
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
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          className={`text-xs font-black uppercase tracking-widest transition-colors px-3 py-2 rounded-lg ${
            billingInterval === "monthly"
              ? "bg-primary text-black"
              : "text-white/40 hover:text-white hover:bg-white/5"
          }`}
          onClick={() => setBillingInterval("monthly")}
        >
          Mensal
        </button>
        <button
          type="button"
          className={`text-xs font-black uppercase tracking-widest transition-colors px-3 py-2 rounded-lg ${
            billingInterval === "yearly"
              ? "bg-primary text-black"
              : "text-white/40 hover:text-white hover:bg-white/5"
          }`}
          onClick={() => setBillingInterval("yearly")}
        >
          Anual
          <span className="ml-2 text-[10px] bg-green-500 text-black px-1.5 py-0.5 rounded-full">
            20% OFF
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
        {subscriptionPlans.map((plan, index) => (
          <Card
            key={plan.slug}
            className={`relative flex flex-col bg-white/5 border transition-all duration-300 group ${
              index === 1
                ? "border-primary/50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] md:scale-105"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Mais Popular
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-black italic uppercase tracking-tighter text-white">
                {plan.name}
              </CardTitle>
              <div className="flex flex-col mt-4">
                {plan.oldPrice && (
                  <span className="text-xs text-white/40 line-through mb-1">
                    R$ {plan.oldPrice.monthly.toFixed(2).replace(".", ",")}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black italic text-white">
                    R${" "}
                    {billingInterval === "yearly"
                      ? (plan.price.yearly / 12).toFixed(2).replace(".", ",")
                      : plan.price.monthly.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs font-medium text-white/40 uppercase">
                    /mês
                  </span>
                </div>
                {billingInterval === "yearly" && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    R$ {plan.price.yearly.toFixed(2).replace(".", ",")} por ano
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-xs text-white/60"
                  >
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                className={`w-full font-black uppercase text-xs tracking-widest transition-all duration-200 ${
                  index === 1
                    ? "bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
                variant={index === 1 ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.slug)}
                disabled={loading === plan.slug}
              >
                {loading === plan.slug
                  ? "Processando..."
                  : `Assinar ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
