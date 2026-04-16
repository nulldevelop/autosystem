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
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-center gap-2 md:gap-4 px-2">
        <button
          type="button"
          className={`flex-1 sm:flex-none text-[9px] md:text-xs font-black uppercase tracking-widest transition-all px-3 py-2.5 rounded-lg border ${
            billingInterval === "monthly"
              ? "bg-primary text-black border-primary"
              : "text-white/40 border-white/5 hover:text-white hover:bg-white/5"
          }`}
          onClick={() => setBillingInterval("monthly")}
        >
          Mensal
        </button>
        <button
          type="button"
          className={`flex-1 sm:flex-none text-[9px] md:text-xs font-black uppercase tracking-widest transition-all px-3 py-2.5 rounded-lg border ${
            billingInterval === "yearly"
              ? "bg-primary text-black border-primary"
              : "text-white/40 border-white/5 hover:text-white hover:bg-white/5"
          }`}
          onClick={() => setBillingInterval("yearly")}
        >
          Anual
          <span className="ml-1 md:ml-2 text-[8px] md:text-[10px] bg-green-500 text-black px-1.5 py-0.5 rounded-full">
            -20%
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 max-w-5xl mx-auto px-1">
        {subscriptionPlans.map((plan, index) => (
          <Card
            key={plan.slug}
            className={`relative flex flex-col bg-white/5 border transition-all duration-300 group !w-full !mx-0 ${
              index === 1
                ? "border-primary/50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] md:scale-105 z-10"
                : "border-white/10 hover:border-white/20"
            }`}
          >
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter flex items-center gap-1 shadow-xl">
                <Sparkles className="w-3 h-3" /> Mais Popular
              </div>
            )}

            <CardHeader className="pb-4 pt-8 md:pt-6">
              <CardTitle className="text-xl md:text-lg font-black italic uppercase tracking-tighter text-white">
                {plan.name}
              </CardTitle>
              <div className="flex flex-col mt-4">
                {plan.oldPrice && (
                  <span className="text-[10px] text-white/40 line-through mb-1">
                    DE R$ {plan.oldPrice.monthly.toFixed(2).replace(".", ",")}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-3xl font-black italic text-white tracking-tighter">
                    R${" "}
                    {billingInterval === "yearly"
                      ? (plan.price.yearly / 12).toFixed(2).replace(".", ",")
                      : plan.price.monthly.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-[10px] font-black text-white/30 uppercase">
                    /mês
                  </span>
                </div>
                {billingInterval === "yearly" && (
                  <p className="text-[10px] text-primary mt-1 font-black uppercase italic tracking-widest">
                    R$ {plan.price.yearly.toFixed(2).replace(".", ",")} anuais
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-6">
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-[11px] md:text-xs text-white/60 leading-tight"
                  >
                    <div className="size-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4 pb-6">
              <Button
                className={`w-full h-12 md:h-10 font-black uppercase text-[10px] tracking-widest transition-all duration-300 ${
                  index === 1
                    ? "bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 scale-100 hover:scale-[1.02]"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
                variant={index === 1 ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.slug)}
                disabled={loading === plan.slug}
              >
                {loading === plan.slug
                  ? "Processando..."
                  : `Ativar ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
