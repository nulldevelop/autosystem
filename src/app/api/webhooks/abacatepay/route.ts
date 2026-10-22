import { timingSafeEqual } from "node:crypto";
import { addMonths } from "date-fns";
import { NextResponse } from "next/server";
import type { Plan } from "@/generated/prisma/client";
import { cancelSubscription, getSubscription } from "@/lib/abacatepay";
import { sendEmail } from "@/lib/email";
import { purchaseThanksTemplate } from "@/lib/email/templates";
import { prisma } from "@/lib/prisma";
import { rewardReferrerForFirstPayment } from "@/lib/referral";
import { PLANS } from "@/utils/plans";

function secretMatches(received: string | null) {
  const expected = process.env.ABACATEPAY_WEBHOOK_SECRET;
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Primeiro valor string com o prefixo dado (subs_, cust_...) em qualquer ponto do payload. */
function findId(value: unknown, prefix: string): string | undefined {
  if (typeof value === "string") {
    return value.startsWith(prefix) ? value : undefined;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) {
      const found = findId(child, prefix);
      if (found) return found;
    }
  }
  return undefined;
}

async function sendThanksEmail(
  userId: string,
  plan: Plan,
  interval: "monthly" | "yearly",
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (!user) return;

    const origin = process.env.NEXT_PUBLIC_APP_URL || "";
    const { subject, html } = purchaseThanksTemplate(user, {
      planName: PLANS[plan].name,
      interval,
      dashboardUrl: `${origin}/dashboard`,
    });
    await sendEmail({ to: user.email, subject, html });
  } catch (error) {
    // e-mail nunca deve fazer o webhook falhar e ser reenviado
    console.error("Erro ao enviar e-mail de agradecimento:", error);
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (!secretMatches(url.searchParams.get("webhookSecret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { event?: string; data?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event;
  if (!event?.startsWith("subscription.")) {
    return NextResponse.json({ received: true });
  }

  try {
    const subscriptionId = findId(payload.data, "subs_");
    const customerId = findId(payload.data, "cust_");
    if (!subscriptionId && !customerId) {
      console.error("Webhook sem identificador de assinatura:", event);
      return NextResponse.json({ received: true });
    }

    // O payload não é fonte de estado: consulta a API para obter o status real.
    const remote = await getSubscription(
      subscriptionId ? { id: subscriptionId } : { customerId },
    );

    const row =
      (await prisma.subscription.findUnique({
        where: { abacatepaySubscriptionId: remote.id },
      })) ??
      (remote.checkoutId
        ? await prisma.subscription.findFirst({
            where: { abacatepayCheckoutId: remote.checkoutId },
          })
        : null) ??
      (remote.customerId
        ? await prisma.subscription.findUnique({
            where: { abacatepayCustomerId: remote.customerId },
          })
        : null);

    if (!row) {
      console.error("Assinatura local não encontrada para", remote.id);
      return NextResponse.json({ received: true });
    }

    const months = row.pendingInterval === "yearly" ? 12 : 1;

    switch (event) {
      case "subscription.completed": {
        if (remote.status !== "ACTIVE") break;

        const previousId = row.abacatepaySubscriptionId;
        await prisma.subscription.update({
          where: { id: row.id },
          data: {
            plan: row.pendingPlan ?? row.plan,
            status: "active",
            abacatepaySubscriptionId: remote.id,
            currentPeriodEnd: addMonths(new Date(), months),
          },
        });

        // troca de plano: encerra a assinatura anterior para não cobrar duas vezes
        if (previousId && previousId !== remote.id) {
          await cancelSubscription(previousId).catch((error) =>
            console.error("Falha ao cancelar assinatura anterior:", error),
          );
        }

        await rewardReferrerForFirstPayment(row.userId);

        // só agradece na primeira vez que esta assinatura é registrada (webhook pode repetir)
        if (previousId !== remote.id) {
          await sendThanksEmail(
            row.userId,
            row.pendingPlan ?? row.plan,
            row.pendingInterval === "yearly" ? "yearly" : "monthly",
          );
        }
        break;
      }

      case "subscription.renewed": {
        if (row.abacatepaySubscriptionId !== remote.id) break;
        const base =
          row.currentPeriodEnd && row.currentPeriodEnd > new Date()
            ? row.currentPeriodEnd
            : new Date();
        await prisma.subscription.update({
          where: { id: row.id },
          data: { status: "active", currentPeriodEnd: addMonths(base, months) },
        });
        break;
      }

      case "subscription.cancelled": {
        // ignora o cancelamento da assinatura antiga numa troca de plano
        if (row.abacatepaySubscriptionId !== remote.id) break;
        await prisma.subscription.update({
          where: { id: row.id },
          data: { status: "canceled" },
        });
        break;
      }

      default:
        console.log(`Unhandled AbacatePay event: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing AbacatePay webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 },
    );
  }
}
