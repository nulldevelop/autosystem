"use client";

import type { PlanSlug } from "@/utils/plans/types";
import { toast } from "sonner";

type BillingInterval = "monthly" | "yearly";

interface CreateCheckoutInput {
  planSlug: PlanSlug;
  billingInterval: BillingInterval;
}

export async function createCheckout({
  planSlug,
  billingInterval,
}: CreateCheckoutInput) {
  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planSlug,
        billingInterval,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.error || "Erro ao criar checkout");
      return {
        success: false,
        error: error.error || "Erro ao criar checkout",
      };
    }

    const { url } = await response.json();

    if (!url) {
      toast.error("URL de checkout não retornada");
      return {
        success: false,
        error: "URL de checkout não retornada",
      };
    }

    // Redirecionar para o Stripe Checkout
    window.location.href = url;

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    toast.error("Erro ao processar checkout");
    return {
      success: false,
      error: "Erro ao processar checkout",
    };
  }
}
