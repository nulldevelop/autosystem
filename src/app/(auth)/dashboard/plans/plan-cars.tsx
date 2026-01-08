"use client";

import { Check } from "lucide-react";
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
    <div className="space-y-6">
      {/* Toggle de intervalo de cobrança */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          className={`text-sm font-medium transition-colors ${
            billingInterval === "monthly"
              ? "text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
          onClick={() => setBillingInterval("monthly")}
        >
          Mensal
        </button>
        <button
          type="button"
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
          onClick={() =>
            setBillingInterval(
              billingInterval === "monthly" ? "yearly" : "monthly",
            )
          }
          aria-label="Alternar intervalo de cobrança"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingInterval === "yearly" ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <button
          type="button"
          className={`text-sm font-medium transition-colors ${
            billingInterval === "yearly"
              ? "text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
          onClick={() => setBillingInterval("yearly")}
        >
          Anual
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {subscriptionPlans.map((plan, index) => (
          <Card
            key={plan.slug}
            className={`flex flex-col bg-black/50 border ${
              index === 1
                ? "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)] scale-105"
                : "border-white/10"
            } transition-all duration-200 hover:border-white/20`}
          >
            {index === 1 && (
              <div className="bg-green-500 text-black text-center text-xs font-black py-2 uppercase tracking-wider">
                Melhor Escolha
              </div>
            )}

            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-white">
                {plan.name}
              </CardTitle>
              <div className="flex flex-col mt-4">
                {plan.oldPrice && (
                  <span className="text-sm text-gray-500 line-through mb-1">
                    R$ {plan.oldPrice.monthly.toFixed(2).replace(".", ",")}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    R${" "}
                    {billingInterval === "yearly"
                      ? plan.price.yearly.toFixed(2).replace(".", ",")
                      : plan.price.monthly.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-sm font-medium text-gray-400">
                    {billingInterval === "yearly" ? "/ano" : "/mês"}
                  </span>
                </div>
                {billingInterval === "yearly" && (
                  <p className="text-xs text-green-500 mt-1">
                    Economize{" "}
                    {(plan.price.monthly * 12 - plan.price.yearly)
                      .toFixed(2)
                      .replace(".", ",")}{" "}
                    por ano
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-6">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-gray-300"
                  >
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                className={`w-full font-semibold transition-all duration-200 ${
                  index === 1
                    ? "bg-green-500 hover:bg-green-600 text-black"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
                variant={index === 1 ? "default" : "outline"}
                onClick={() => handleSelectPlan(plan.slug)}
                disabled={loading === plan.slug}
              >
                {loading === plan.slug
                  ? "Processando..."
                  : `Escolher ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
