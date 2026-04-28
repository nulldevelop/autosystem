import {
  ArrowRight,
  Car,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./dashboard-client";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

async function getHasOrg(userId: string): Promise<boolean> {
  const membership = await prisma.member.findFirst({
    where: { userId },
  });
  return !!membership;
}

async function getOrgStats(orgId: string) {
  try {
    const [org, totalCustomers, budgetsStats, recentBudgets, totalBudgetsCount] =
      await Promise.all([
        prisma.organization.findUnique({ where: { id: orgId } }),
        prisma.customer.count({ where: { organizationId: orgId } }),
        prisma.budget.aggregate({
          where: { organizationId: orgId, status: "aproved" },
          _sum: { totalAmount: true },
          _count: { _all: true },
        }),
        prisma.budget.findMany({
          where: { organizationId: orgId, status: "pending" },
          include: { customer: true, vehicle: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.budget.count({ where: { organizationId: orgId } }),
      ]);

    return {
      org,
      totalCustomers,
      approvedAmount: budgetsStats._sum.totalAmount || 0,
      approvedCount: budgetsStats._count._all || 0,
      recentBudgets,
      totalBudgetsCount,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return {
      org: null,
      totalCustomers: 0,
      approvedAmount: 0,
      approvedCount: 0,
      recentBudgets: [],
      totalBudgetsCount: 0,
    };
  }
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth");
  }

  const hasOrg = await getHasOrg(session.user.id);
  const orgId = session.session.activeOrganizationId;
  const stats = orgId ? await getOrgStats(orgId) : null;

  const totalRevenue = stats?.approvedAmount || 0;
  const totalCustomers = stats?.totalCustomers || 0;
  const totalBudgets = stats?.totalBudgetsCount || 0;
  const pendingBudgets = stats?.recentBudgets || [];

  return (
    <DashboardClient hasOrg={hasOrg}>
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-primary font-medium text-sm uppercase tracking-widest">
              {getGreeting()}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-1 tracking-tight">
              {session.user.name?.split(" ")[0] || "Usuário"}
            </h1>
            {stats?.org && (
              <p className="text-white/40 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {stats.org.name}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5 hover:border-primary/40 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary/80">
                  Orçamentos
                </span>
                <FileText className="w-5 h-5 text-primary/60" />
              </div>
              <p className="text-4xl font-black text-white">{totalBudgets}</p>
              <p className="text-xs text-white/40 mt-1">Total registrado</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 p-5 hover:border-blue-500/40 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400/80">
                  Clientes
                </span>
                <Users className="w-5 h-5 text-blue-400/60" />
              </div>
              <p className="text-4xl font-black text-white">{totalCustomers}</p>
              <p className="text-xs text-white/40 mt-1">Cadastrados</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 p-5 hover:border-green-500/40 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-green-400/80">
                  Aprovados
                </span>
                <TrendingUp className="w-5 h-5 text-green-400/60" />
              </div>
              <p className="text-4xl font-black text-white">
                {stats?.approvedCount || 0}
              </p>
              <p className="text-xs text-white/40 mt-1">Orçamentos</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80">
                  Faturamento
                </span>
                <TrendingUp className="w-5 h-5 text-amber-400/60" />
              </div>
              <p className="text-3xl font-black text-white">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-white/40 mt-1">Total aprovado</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Orçamentos Pendentes
              </h2>
              <span className="text-xs font-medium text-white/40">
                {pendingBudgets.length} mais recentes
              </span>
            </div>
            <div className="divide-y divide-white/5">
              {pendingBudgets.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-medium">
                    Nenhum orçamento pendente
                  </p>
                  <p className="text-white/20 text-sm mt-1">
                    Novos orçamentos aparecerão aqui
                  </p>
                </div>
              ) : (
                pendingBudgets.slice(0, 5).map((budget) => (
                  <div
                    key={budget.id}
                    className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {budget.customer?.name || "Cliente"}
                        </p>
                        <p className="text-sm text-white/40">
                          {budget.vehicle?.marca} {budget.vehicle?.model} •{" "}
                          {budget.vehicle?.licensePlate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">
                        {formatCurrency(budget.totalAmount)}
                      </p>
                      <p className="text-xs text-white/40">
                        {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                Ações Rápidas
              </h2>
              <div className="space-y-2">
                <Link
                  href="/dashboard/budget"
                  className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group"
                >
                  <span className="text-sm font-medium text-white">
                    Novo Orçamento
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard/customer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <span className="text-sm font-medium text-white">
                    Novo Cliente
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard/vehicle"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <span className="text-sm font-medium text-white">
                    Ver Veículos
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardClient>
  );
}
