"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getFinancialData() {
  const session = await getSession();
  const orgId = session?.session.activeOrganizationId;

  if (!orgId) return null;

  // Realiza agregações diretamente no banco de dados para melhor performance
  const [transactions, incomeStats, expenseStats, receivableStats] =
    await Promise.all([
      prisma.transaction.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 50, // Limite para evitar payload excessivo
      }),
      prisma.transaction.aggregate({
        where: { organizationId: orgId, type: "INCOME", status: "PAID" },
        _sum: { amount: true, costAmount: true, netAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { organizationId: orgId, type: "EXPENSE", status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { organizationId: orgId, type: "INCOME", status: "PENDING" },
        _sum: { amount: true },
      }),
    ]);

  const stats = {
    totalBalance:
      (incomeStats._sum.amount || 0) - (expenseStats._sum.amount || 0),
    pendingReceivable: receivableStats._sum.amount || 0,
    monthlyExpenses: expenseStats._sum.amount || 0,
    totalGross: incomeStats._sum.amount || 0,
    totalPartsCost: incomeStats._sum.costAmount || 0,
    totalNet: incomeStats._sum.netAmount || 0,
  };

  return { transactions, stats };
}
