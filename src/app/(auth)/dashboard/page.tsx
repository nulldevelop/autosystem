import { addDays, differenceInDays } from "date-fns";
import {
  ArrowRight,
  Car,
  CheckCircle,
  CircleAlert,
  Clock,
  DollarSign,
  FileText,
  Package,
  PartyPopper,
  Rocket,
  TrendingUp,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { planRoutes, trialRoutes } from "@/utils/permissions/plan-features";
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits";
import { getBudgetsCount } from "./_data-access/get-budgets-count";
import { getCustomersCount } from "./_data-access/get-customers-count";
import { getSubscription } from "./_data-access/get-subscriptio";
import { getVehiclesCount } from "./_data-access/get-vehicles-count";

async function getRecentServiceOrders() {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return [];

  return prisma.serviceOrder.findMany({
    where: { organizationId: session.session.activeOrganizationId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: true, vehicle: true },
  });
}

async function getRecentBudgets() {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return [];

  return prisma.budget.findMany({
    where: { organizationId: session.session.activeOrganizationId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: true, vehicle: true },
  });
}

async function getServiceOrdersInProgress() {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return 0;

  return prisma.serviceOrder.count({
    where: {
      organizationId: session.session.activeOrganizationId,
      status: { in: ["open", "in_progress"] },
    },
  });
}

async function getTotalRevenue() {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return 0;

  const result = await prisma.serviceOrder.aggregate({
    where: {
      organizationId: session.session.activeOrganizationId,
      status: "completed",
    },
    _sum: { totalAmount: true },
  });

  return result._sum.totalAmount || 0;
}

async function getRevenueThisMonth() {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await prisma.serviceOrder.aggregate({
    where: {
      organizationId: session.session.activeOrganizationId,
      status: "completed",
      updatedAt: { gte: startOfMonth },
    },
    _sum: { totalAmount: true },
  });

  return result._sum.totalAmount || 0;
}

async function getNetProfit() {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return 0;

  const result = await prisma.transaction.aggregate({
    where: {
      organizationId: session.session.activeOrganizationId,
      type: "INCOME",
      status: "PAID",
    },
    _sum: { netAmount: true },
  });

  return result._sum.netAmount || 0;
}

async function getProductsCount() {
  const session = await getSession();
  if (!session?.session?.activeOrganizationId) return 0;

  return prisma.product.count({
    where: { organizationId: session.session.activeOrganizationId },
  });
}

function getStatusBadge(status: string) {
  const statusConfig: Record<
    string,
    { color: string; icon: React.ReactNode; label: string }
  > = {
    open: {
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      icon: <Clock className="w-3 h-3 mr-1" />,
      label: "Aberto",
    },
    in_progress: {
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: <Wrench className="w-3 h-3 mr-1" />,
      label: "Em Andamento",
    },
    completed: {
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
      label: "Concluído",
    },
    canceled: {
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: <XCircle className="w-3 h-3 mr-1" />,
      label: "Cancelado",
    },
    pending: {
      color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      icon: <FileText className="w-3 h-3 mr-1" />,
      label: "Rascunho",
    },
    approved: {
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
      label: "Aprovado",
    },
    aproved: {
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      icon: <CheckCircle className="w-3 h-3 mr-1" />,
      label: "Aprovado",
    },
    rejected: {
      color: "bg-red-500/20 text-red-400 border-red-500/30",
      icon: <XCircle className="w-3 h-3 mr-1" />,
      label: "Rejeitado",
    },
  };

  const config = statusConfig[status] || {
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    icon: <FileText className="w-3 h-3 mr-1" />,
    label: status,
  };

  return (
    <Badge variant="outline" className={config.color}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default async function DashboardPage() {
  const session = await getSession();

  const [
    customersCount,
    vehiclesCount,
    budgetsCount,
    productsCount,
    recentServiceOrders,
    recentBudgets,
    serviceOrdersInProgress,
    totalRevenue,
    revenueThisMonth,
    netProfit,
    subscription,
  ] = await Promise.all([
    getCustomersCount(),
    getVehiclesCount(),
    getBudgetsCount(),
    getProductsCount(),
    getRecentServiceOrders(),
    getRecentBudgets(),
    getServiceOrdersInProgress(),
    getTotalRevenue(),
    getRevenueThisMonth(),
    getNetProfit(),
    session?.user?.id ? getSubscription(session.user.id) : null,
  ]);

  let allowedRoutes: string[] = [];
  if (session) {
    if (subscription && subscription.status === "active") {
      allowedRoutes =
        planRoutes[subscription.plan as keyof typeof planRoutes] || [];
    } else {
      const trialEndDate = addDays(
        new Date(session.user.createdAt),
        TRIAL_DAYS,
      );
      const daysRemaining = differenceInDays(trialEndDate, new Date());
      if (daysRemaining > 0) {
        allowedRoutes = trialRoutes || [
          "/dashboard/budget",
          "/dashboard/service",
          "/dashboard/customer",
          "/dashboard/vehicle",
          "/dashboard/product",
        ];
      }
    }
  }

  const stats = [
    {
      title: "Clientes",
      count: customersCount,
      icon: Users,
      href: "/dashboard/customer",
    },
    {
      title: "Veículos",
      count: vehiclesCount,
      icon: Car,
      href: "/dashboard/vehicle",
    },
    {
      title: "Orçamentos",
      count: budgetsCount,
      icon: FileText,
      href: "/dashboard/budget",
    },
    {
      title: "Produtos",
      count: productsCount,
      icon: Package,
      href: "/dashboard/product",
    },
  ];

  const visibleStats = stats.filter((stat) =>
    allowedRoutes.includes(stat.href),
  );

  let subscriptionMessage = "";
  let subscriptionType: "active" | "trial" | "expired" = "trial";

  if (subscription && subscription.status === "active") {
    const daysRemaining = subscription.stripeCurrentPeriodEnd
      ? differenceInDays(subscription.stripeCurrentPeriodEnd, new Date())
      : 0;
    if (daysRemaining <= 7 && daysRemaining > 0) {
      subscriptionMessage = `Plano expira em ${daysRemaining} dia(s)`;
      subscriptionType = "expired";
    } else {
      subscriptionMessage = `Plano ${subscription.plan} ativo`;
      subscriptionType = "active";
    }
  } else {
    const trialEndDate = addDays(
      new Date(session?.user?.createdAt || new Date()),
      TRIAL_DAYS,
    );
    const daysRemaining = differenceInDays(trialEndDate, new Date());
    if (daysRemaining <= 0) {
      subscriptionMessage = "Período de teste expirado";
      subscriptionType = "expired";
    } else {
      subscriptionMessage = `Teste: ${daysRemaining} dias restantes`;
      subscriptionType = "trial";
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white font-poppins">
          Dashboard <span className="text-primary">Overview</span>
        </h1>
        <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">
          Desempenho em tempo real da sua oficina
        </p>
      </div>

      <div
        className={`p-4 rounded-xl border flex items-center gap-4 ${
          subscriptionType === "active"
            ? "bg-green-500/10 border-green-500/20"
            : subscriptionType === "expired"
              ? "bg-red-500/10 border-red-500/20"
              : "bg-blue-500/10 border-blue-500/20"
        }`}
      >
        {subscriptionType === "active" && (
          <PartyPopper className="h-5 w-5 shrink-0 text-green-500" />
        )}
        {subscriptionType === "expired" && (
          <CircleAlert className="h-5 w-5 shrink-0 text-red-500" />
        )}
        {subscriptionType === "trial" && (
          <Rocket className="h-5 w-5 shrink-0 text-blue-500" />
        )}
        <span className="text-xs md:text-sm text-white/80 leading-tight">{subscriptionMessage}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleStats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="bg-white/5 border-white/10 hover:border-primary/30 hover:bg-white/[0.02] transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-black italic tracking-tighter text-white">
                      {stat.count}
                    </p>
                  </div>
                  <stat.icon className="size-8 text-white/20 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black italic tracking-tighter text-white">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Desde o início</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black italic tracking-tighter text-green-400">
              {formatCurrency(netProfit)}
            </p>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Receita - Custo Peças</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Receita do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black italic tracking-tighter text-white">
              {formatCurrency(revenueThisMonth)}
            </p>
            <p className="text-[10px] text-white/40 mt-1 uppercase">Março 2026</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Serviços em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black italic tracking-tighter text-white">
              {serviceOrdersInProgress}
            </p>
            <p className="text-[10px] text-white/40 mt-1 uppercase">
              Ordens de serviço ativas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-black italic uppercase tracking-tighter text-white">
              Ordens de Serviço Recentes
            </CardTitle>
            <Link href="/dashboard/service">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-black uppercase text-white/40 hover:text-white h-7"
              >
                Ver todos <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 px-3 md:px-6">
            {recentServiceOrders.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">
                Nenhuma ordem de serviço encontrada
              </p>
            ) : (
              recentServiceOrders.map((order) => (
                <Link key={order.id} href={`/dashboard/service/${order.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate group-hover:text-primary transition-colors uppercase italic tracking-tighter">
                        {order.vehicle?.licensePlate || "Sem placa"}
                      </p>
                      <p className="text-[10px] font-bold text-white/40 truncate uppercase tracking-widest">
                        {order.customer?.name || "Cliente não identificado"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <span className="text-xs text-white/60 font-mono font-bold">
                        {formatCurrency(order.totalAmount || 0)}
                      </span>
                      <div className="scale-90 origin-right">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-black italic uppercase tracking-tighter text-white">
              Orçamentos Recentes
            </CardTitle>
            <Link href="/dashboard/budget">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] font-black uppercase text-white/40 hover:text-white h-7"
              >
                Ver todos <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 px-3 md:px-6">
            {recentBudgets.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">
                Nenhum orçamento encontrado
              </p>
            ) : (
              recentBudgets.map((budget) => (
                <Link key={budget.id} href={`/dashboard/budget/${budget.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate group-hover:text-primary transition-colors uppercase italic tracking-tighter">
                        {budget.vehicle?.licensePlate || "Sem placa"}
                      </p>
                      <p className="text-[10px] font-bold text-white/40 truncate uppercase tracking-widest">
                        {budget.customer?.name || "Cliente não identificado"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                      <span className="text-xs text-white/60 font-mono font-bold">
                        {formatCurrency(budget.totalAmount || 0)}
                      </span>
                      <div className="scale-90 origin-right">
                        {getStatusBadge(budget.status)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
