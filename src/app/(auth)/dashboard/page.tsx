import {
  ArrowRight,
  Car,
  Clock,
  DollarSign,
  FileText,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Plate } from "@/components/app/plate";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
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
    const [
      org,
      totalCustomers,
      budgetsStats,
      recentBudgets,
      totalBudgetsCount,
    ] = await Promise.all([
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
      <div className="space-y-6 sm:space-y-8">
        <PageHeader
          eyebrow={stats?.org?.name}
          title={`${getGreeting()}, ${session.user.name?.split(" ")[0] || "bem-vindo"}`}
          description="Resumo da oficina: o que está aberto e o que já foi fechado."
          actions={
            <Button asChild>
              <Link href="/dashboard/budget?create=true">
                <Plus /> Novo orçamento
              </Link>
            </Button>
          }
        />

        <section
          aria-label="Indicadores"
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          <StatCard
            label="Orçamentos"
            value={totalBudgets}
            hint="Total registrado"
            icon={FileText}
            tone="primary"
          />
          <StatCard
            label="Clientes"
            value={totalCustomers}
            hint="Cadastrados"
            icon={Users}
            tone="info"
          />
          <StatCard
            label="Aprovados"
            value={stats?.approvedCount || 0}
            hint="Orçamentos fechados"
            icon={TrendingUp}
            tone="primary"
          />
          <StatCard
            label="Faturamento"
            value={formatCurrency(totalRevenue)}
            hint="Total aprovado"
            icon={DollarSign}
            tone="warning"
          />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2" aria-labelledby="pending-title">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="pending-title" className="text-base font-semibold">
                Aguardando aprovação
              </h2>
              <Link
                href="/dashboard/budget"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Ver todos <ArrowRight className="size-3.5" />
              </Link>
            </div>

            {pendingBudgets.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Nenhum orçamento pendente"
                description="Quando você enviar um orçamento ao cliente, ele aparece aqui até ser aprovado."
              />
            ) : (
              <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {pendingBudgets.slice(0, 5).map((budget) => (
                  <li key={budget.id}>
                    <Link
                      href={`/dashboard/budget/${budget.id}`}
                      className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0 space-y-1.5">
                        <p className="truncate font-medium">
                          {budget.customer?.name || "Cliente"}
                        </p>
                        <div className="flex min-w-0 items-center gap-2">
                          <Plate value={budget.vehicle?.licensePlate} />
                          <span className="truncate text-sm text-muted-foreground">
                            {budget.vehicle
                              ? `${budget.vehicle.marca} ${budget.vehicle.model}`
                              : "Sem veículo"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="num font-semibold">
                          {formatCurrency(budget.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(budget.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="quick-title">
            <h2 id="quick-title" className="mb-3 text-base font-semibold">
              Atalhos
            </h2>
            <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  href: "/dashboard/budget?create=true",
                  label: "Novo orçamento",
                  icon: FileText,
                },
                {
                  href: "/dashboard/customer?create=true",
                  label: "Novo cliente",
                  icon: Users,
                },
                {
                  href: "/dashboard/vehicle",
                  label: "Ver veículos",
                  icon: Car,
                },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex min-h-12 items-center gap-3 rounded-xl border bg-card px-4 text-sm font-medium transition-colors hover:border-primary/40"
                >
                  <Icon className="size-4 text-primary" aria-hidden />
                  <span className="flex-1">{label}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardClient>
  );
}
