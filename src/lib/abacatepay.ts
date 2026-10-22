import type { Plan } from "@/generated/prisma/client";

const BASE_URL = "https://api.abacatepay.com/v2";

export type BillingInterval = "monthly" | "yearly";

type Envelope<T> = { data: T; success: boolean; error: string | null };

export type AbacatePaySubscription = {
  id: string;
  checkoutId?: string;
  customerId?: string;
  amount: number;
  status: "PENDING" | "ACTIVE" | "CANCELLED";
};

async function request<T>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown },
): Promise<T> {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) throw new Error("ABACATEPAY_API_KEY não configurada");

  const response = await fetch(`${BASE_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !json?.success) {
    throw new Error(
      `AbacatePay ${path} falhou (${response.status}): ${json?.error ?? "sem detalhes"}`,
    );
  }
  return json.data;
}

export function createCustomer(input: {
  email: string;
  name?: string;
  userId: string;
}) {
  return request<{ id: string }>("/customers/create", {
    method: "POST",
    body: {
      email: input.email,
      name: input.name,
      metadata: { userId: input.userId },
    },
  });
}

export function createSubscriptionCheckout(input: {
  productId: string;
  customerId: string;
  externalId: string;
  completionUrl: string;
  returnUrl: string;
  metadata: Record<string, string>;
}) {
  return request<{ id: string; url: string }>("/subscriptions/create", {
    method: "POST",
    body: {
      items: [{ id: input.productId, quantity: 1 }],
      customerId: input.customerId,
      externalId: input.externalId,
      completionUrl: input.completionUrl,
      returnUrl: input.returnUrl,
      metadata: input.metadata,
    },
  });
}

export function getSubscription(query: {
  id?: string;
  customerId?: string;
  externalId?: string;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  return request<AbacatePaySubscription>(
    `/subscriptions/get?${params.toString()}`,
  );
}

export function cancelSubscription(id: string) {
  return request<AbacatePaySubscription>("/subscriptions/cancel", {
    method: "POST",
    body: { id },
  });
}

// Produtos são criados uma vez no painel da AbacatePay (cycle MONTHLY / ANNUALLY)
// e os IDs ficam em variáveis de ambiente.
const PRODUCT_ENV: Record<Plan, Record<BillingInterval, string>> = {
  BASIC: {
    monthly: "ABACATEPAY_BASIC_MONTHLY_PRODUCT_ID",
    yearly: "ABACATEPAY_BASIC_YEARLY_PRODUCT_ID",
  },
  PLUS: {
    monthly: "ABACATEPAY_PLUS_MONTHLY_PRODUCT_ID",
    yearly: "ABACATEPAY_PLUS_YEARLY_PRODUCT_ID",
  },
  PROFESSIONAL: {
    monthly: "ABACATEPAY_PRO_MONTHLY_PRODUCT_ID",
    yearly: "ABACATEPAY_PRO_YEARLY_PRODUCT_ID",
  },
};

export function getProductId(plan: Plan, interval: BillingInterval) {
  return process.env[PRODUCT_ENV[plan][interval]];
}
