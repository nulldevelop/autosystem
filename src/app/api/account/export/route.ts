import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Exportação dos dados do titular (LGPD, art. 18, II e V).
 * Entrega em JSON o cadastro do usuário e os dados das oficinas em que ele é dono.
 * Nunca inclui senha, tokens ou sessões.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const userId = session.user.id;

  const limit = await rateLimit(`export-data:${userId}`, {
    limit: 5,
    windowSeconds: 60 * 60,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Muitas exportações. Tente novamente mais tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const [user, subscription, billingEvents, memberships] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        trialStartedAt: true,
      },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        plan: true,
        status: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
        bonusUntil: true,
        createdAt: true,
      },
    }),
    prisma.billingEvent.findMany({
      where: { userId },
      select: {
        type: true,
        plan: true,
        interval: true,
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.member.findMany({
      where: { userId, role: "owner" },
      select: { organizationId: true },
    }),
  ]);

  const organizations = await Promise.all(
    memberships.map(async ({ organizationId }) => {
      const where = { organizationId };
      const [
        organization,
        customers,
        vehicles,
        budgets,
        serviceOrders,
        products,
        transactions,
      ] = await Promise.all([
        prisma.organization.findUnique({ where: { id: organizationId } }),
        prisma.customer.findMany({ where }),
        prisma.vehicle.findMany({ where }),
        prisma.budget.findMany({
          where,
          include: { items: true, photos: true },
        }),
        prisma.serviceOrder.findMany({ where, include: { items: true } }),
        prisma.product.findMany({ where, include: { movements: true } }),
        prisma.transaction.findMany({ where }),
      ]);
      return {
        organization,
        customers,
        vehicles,
        budgets,
        serviceOrders,
        products,
        transactions,
      };
    }),
  );

  const payload = {
    exportedAt: new Date().toISOString(),
    user,
    subscription,
    billingEvents,
    organizations,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="meus-dados-autosystem-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
