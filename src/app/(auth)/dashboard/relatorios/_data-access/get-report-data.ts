"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, format } from "date-fns";

export async function getReportData(startDate?: Date, endDate?: Date) {
  const session = await getSession();
  const orgId = session?.session.activeOrganizationId;

  if (!orgId) return null;

  const start = startDate || startOfMonth(new Date());
  const end = endDate || endOfMonth(new Date());

  const [transactions, serviceOrders, budgets, customers] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        organizationId: orgId,
        paymentDate: {
          gte: start,
          lte: end,
        },
        status: "PAID",
      },
    }),
    prisma.serviceOrder.findMany({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        items: true,
      },
    }),
    prisma.budget.findMany({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
    prisma.customer.findMany({
      where: {
        organizationId: orgId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    }),
  ]);

  // Calculations
  const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalCost = transactions.reduce((acc, t) => acc + t.costAmount, 0);
  const totalNet = transactions.reduce((acc, t) => acc + t.netAmount, 0);

  const completedOS = serviceOrders.filter((os) => os.status === "completed").length;
  const averageTicket = completedOS > 0 ? totalRevenue / completedOS : 0;

  const approvedBudgets = budgets.filter((b) => b.status === "aproved").length;
  const totalBudgets = budgets.length;
  const conversionRate = totalBudgets > 0 ? (approvedBudgets / totalBudgets) * 100 : 0;

  // Revenue by Category
  const revenueByCategory = transactions.reduce((acc: Record<string, number>, t) => {
    const category = t.category || "OTHER";
    acc[category] = (acc[category] || 0) + t.amount;
    return acc;
  }, {});

  // Revenue by Payment Method
  const revenueByPaymentMethod = transactions.reduce((acc: Record<string, number>, t) => {
    const method = t.paymentMethod || "N/A";
    acc[method] = (acc[method] || 0) + t.amount;
    return acc;
  }, {});

  // Revenue Over Time (Daily)
  const revenueOverTime = transactions.reduce((acc: Record<string, number>, t) => {
    if (!t.paymentDate) return acc;
    const day = format(t.paymentDate, "yyyy-MM-dd");
    acc[day] = (acc[day] || 0) + t.amount;
    return acc;
  }, {});

  return {
    metrics: {
      totalRevenue,
      totalCost,
      totalNet,
      averageTicket,
      newCustomers: customers.length,
      completedOS,
      conversionRate,
    },
    revenueByCategory,
    revenueByPaymentMethod,
    revenueOverTime: Object.entries(revenueOverTime).map(([date, amount]) => ({ date, amount })),
    period: { start, end },
  };
}
