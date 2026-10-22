import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Plan } from "@/generated/prisma/client";
import {
  type BillingInterval,
  createCustomer,
  createSubscriptionCheckout,
  getProductId,
} from "@/lib/abacatepay";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { planSlug, billingInterval } = (await request.json()) as {
      planSlug?: string;
      billingInterval?: string;
    };

    if (!planSlug || !billingInterval) {
      return NextResponse.json(
        { error: "Plano e intervalo de cobrança são obrigatórios" },
        { status: 400 },
      );
    }

    if (billingInterval !== "monthly" && billingInterval !== "yearly") {
      return NextResponse.json(
        { error: "Intervalo de cobrança inválido" },
        { status: 400 },
      );
    }

    const plan = subscriptionPlans.find((p) => p.slug === planSlug);
    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 },
      );
    }

    const productId = getProductId(
      plan.slug as Plan,
      billingInterval as BillingInterval,
    );
    if (!productId) {
      return NextResponse.json(
        { error: "Produto não configurado para este plano" },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    const existing = await prisma.subscription.findUnique({
      where: { userId },
    });

    let customerId = existing?.abacatepayCustomerId;
    if (!customerId) {
      const customer = await createCustomer({
        email: session.user.email,
        name: session.user.name || undefined,
        userId,
      });
      customerId = customer.id;
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const checkout = await createSubscriptionCheckout({
      productId,
      customerId,
      externalId: userId,
      completionUrl: `${origin}/dashboard/plans/success`,
      returnUrl: `${origin}/dashboard/plans`,
      metadata: { userId, planSlug: plan.slug, billingInterval },
    });

    // O plano só vira "ativo" quando o webhook confirma o pagamento
    const pending = {
      abacatepayCustomerId: customerId,
      abacatepayCheckoutId: checkout.id,
      pendingPlan: plan.slug as Plan,
      pendingInterval: billingInterval,
    };
    await prisma.subscription.upsert({
      where: { userId },
      create: { userId, ...pending },
      update: pending,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de checkout" },
      { status: 500 },
    );
  }
}
