"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getFinancialData() {
  const session = await getSession();
  const orgId = session?.session.activeOrganizationId;

  if (!orgId) return null;

  const transactions = await prisma.transaction.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    include: {
      serviceOrder: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
    },
  });

  const stats = {
    totalBalance: transactions
      .filter((t) => t.status === "PAID")
      .reduce(
        (acc, t) => acc + (t.type === "INCOME" ? t.amount : -t.amount),
        0,
      ),

    pendingReceivable: transactions
      .filter((t) => t.type === "INCOME" && t.status === "PENDING")
      .reduce((acc, t) => acc + t.amount, 0),

    monthlyExpenses: transactions
      .filter(
        (t) =>
          t.type === "EXPENSE" &&
          (t.status === "PAID" || t.status === "PENDING"),
      )
      .reduce((acc, t) => acc + t.amount, 0),

    totalGross: transactions
      .filter(
        (t) =>
          t.type === "INCOME" &&
          (t.status === "PAID" || t.status === "PENDING"),
      )
      .reduce((acc, t) => acc + t.amount, 0),

    totalPartsCost: transactions
      .filter(
        (t) =>
          t.type === "INCOME" &&
          (t.status === "PAID" || t.status === "PENDING"),
      )
      .reduce((acc, t) => acc + t.costAmount, 0),

    totalNet: transactions
      .filter(
        (t) =>
          t.type === "INCOME" &&
          (t.status === "PAID" || t.status === "PENDING"),
      )
      .reduce((acc, t) => acc + t.netAmount, 0),
  };

  return { transactions, stats };
}
