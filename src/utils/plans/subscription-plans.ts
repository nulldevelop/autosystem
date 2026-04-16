import type { PlanSlug } from "./types";

export const subscriptionPlans: Array<{
  name: string;
  slug: PlanSlug;
  quotas: {
    serviceOrders: number | null;
    budgets?: number | null;
  };
  price: {
    monthly: number;
    yearly: number;
  };
  oldPrice?: {
    monthly: number;
    yearly: number;
  };
  priceIds: {
    monthly: string | undefined;
    yearly: string | undefined;
  };
  features: string[];
}> = [
  {
    name: "Basic",
    slug: "BASIC" as PlanSlug,
    quotas: {
      serviceOrders: 20,
      budgets: 20,
    },
    price: {
      monthly: 79.99,
      yearly: 799.9, // ~10 meses (desconto de 2 meses)
    },
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID,
    },
    features: [
      "Até 20 ordens de serviço por mês",
      "Até 20 orçamentos por mês",
      "Gerenciamento de clientes e veículos",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Plus",
    slug: "PLUS" as PlanSlug,
    quotas: {
      serviceOrders: null,
    },
    oldPrice: {
      monthly: 139.99,
      yearly: 1399.9,
    },
    price: {
      monthly: 119.99,
      yearly: 1199.9, // ~10 meses (desconto de 2 meses)
    },
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PLUS_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PLUS_YEARLY_PRICE_ID,
    },
    features: [
      "Ordens de serviço ilimitadas",
      "Gerenciamento de clientes e veículos",
      "Relatórios avançados",
      "Suporte prioritário por e-mail",
    ],
  },
  {
    name: "Professional",
    slug: "PROFESSIONAL" as PlanSlug,
    quotas: {
      serviceOrders: null,
    },
    price: {
      monthly: 179.99,
      yearly: 1799.9, // ~10 meses (desconto de 2 meses)
    },
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    },
    features: [
      "Todos os recursos do plano Plus",
      "API de integração",
      "Gerente de conta dedicado",
      "Suporte por telefone",
    ],
  },
];
