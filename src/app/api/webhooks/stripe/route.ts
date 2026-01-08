import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { Plan } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/utils/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);

          const userId = session.metadata?.userId;
          const planSlug = session.metadata?.planSlug as Plan;

          if (!userId || !planSlug) {
            console.error("Missing userId or planSlug in metadata");
            break;
          }

          const periodEnd = subscription.items.data[0]?.current_period_end;

          // Atualizar ou criar subscription no banco
          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan: planSlug,
              status: "active",
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: periodEnd
                ? new Date(periodEnd * 1000)
                : undefined,
            },
            update: {
              plan: planSlug,
              status: "active",
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: periodEnd
                ? new Date(periodEnd * 1000)
                : undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId = subscription.customer as string;
        const dbSubscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (dbSubscription) {
          const periodEnd = subscription.items.data[0]?.current_period_end;

          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: subscription.status === "active" ? "active" : "canceled",
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeCurrentPeriodEnd: periodEnd
                ? new Date(periodEnd * 1000)
                : undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const customerId = subscription.customer as string;
        const dbSubscription = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (dbSubscription) {
          await prisma.subscription.update({
            where: { id: dbSubscription.id },
            data: {
              status: "canceled",
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }
}
