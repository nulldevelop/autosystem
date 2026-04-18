"use server";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Plan } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";
import { stripe } from "@/utils/stripe";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { planSlug, billingInterval } = body;

    if (!planSlug || !billingInterval) {
      return NextResponse.json(
        { error: "Plano e intervalo de cobrança são obrigatórios" },
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

    const priceId =
      billingInterval === "yearly"
        ? plan.priceIds.yearly
        : plan.priceIds.monthly;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID não configurado para este plano" },
        { status: 400 },
      );
    }

    // Buscar ou criar customer no Stripe
    let customerId: string;
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Salvar customer ID no banco
      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          plan: planSlug as Plan, // Convert PlanSlug to Plan enum
          stripeCustomerId: customerId,
        },
        update: {
          stripeCustomerId: customerId,
        },
      });
    }

    // Criar checkout session
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard/plans/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/plans`,
      metadata: {
        userId: session.user.id,
        planSlug: planSlug,
        billingInterval: billingInterval,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de checkout" },
      { status: 500 },
    );
  }
}
