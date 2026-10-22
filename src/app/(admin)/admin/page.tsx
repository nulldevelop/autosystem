import {
  Ban,
  Building2,
  Gift,
  Receipt,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { requireAdminPage } from "@/lib/admin/guard";
import { getOverview } from "@/lib/admin/queries";
import { PLANS } from "@/utils/plans";
import {
  brl,
  brlFromCents,
  formatDate,
  formatDateTime,
} from "./_components/admin-ui";

const EVENT_LABELS: Record<string, string> = {
  completed: "Nova assinatura",
  renewed: "Renovação",
  cancelled: "Cancelamento",
};

export default async function AdminOverviewPage() {
  await requireAdminPage();
  const data = await getOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        description="Oficinas, assinaturas e receita em um só lugar."
      />

      <section
        aria-label="Indicadores"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatCard
          label="Oficinas"
          value={data.totalOrganizations}
          hint={`+${data.newOrganizations30} nos últimos 30 dias`}
          icon={Building2}
        />
        <StatCard
          label="Usuários"
          value={data.totalUsers}
          hint={`+${data.newUsers30} nos últimos 30 dias`}
          icon={Users}
          tone="info"
        />
        <StatCard
          label="Assinaturas ativas"
          value={data.activeCount}
          hint={`${data.trialUsers} em teste grátis`}
          icon={Wallet}
        />
        <StatCard
          label="Receita mensal (MRR)"
          value={brl(data.mrr)}
          hint="estimada pelas assinaturas ativas"
          icon={TrendingUp}
        />
        <StatCard
          label="Recebido em 30 dias"
          value={brlFromCents(data.revenue30Cents)}
          hint={`${brlFromCents(data.revenueTotalCents)} no total`}
          icon={Receipt}
        />
        <StatCard
          label="Meses grátis ativos"
          value={data.bonusUsers}
          hint="por indicação ou concedidos"
          icon={Gift}
          tone="warning"
        />
        <StatCard
          label="Indicações"
          value={data.referredUsers}
          hint={`${data.rewardedUsers} já pagaram`}
          icon={UserPlus}
          tone="info"
        />
        <StatCard
          label="Bloqueados"
          value={data.blockedUsers}
          icon={Ban}
          tone="danger"
        />
      </section>

      <section aria-labelledby="plans-title" className="rounded-xl border bg-card p-4 sm:p-5">
        <h2 id="plans-title" className="text-base font-semibold">
          Assinantes por plano
        </h2>
        <dl className="mt-3 grid grid-cols-3 gap-4">
          {(["BASIC", "PLUS", "PROFESSIONAL"] as const).map((plan) => (
            <div key={plan}>
              <dt className="text-sm text-muted-foreground">
                {PLANS[plan].name}
              </dt>
              <dd className="num text-2xl font-semibold">
                {data.byPlan[plan]}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="signups-title" className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 id="signups-title" className="text-base font-semibold">
              Últimos cadastros
            </h2>
            <Link href="/admin/usuarios" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="mt-3 divide-y">
            {data.recentUsers.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.name || "Sem nome"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </span>
              </li>
            ))}
            {data.recentUsers.length === 0 && (
              <li className="py-2.5 text-sm text-muted-foreground">
                Nenhum cadastro ainda.
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="events-title" className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 id="events-title" className="text-base font-semibold">
              Últimos pagamentos
            </h2>
            <Link href="/admin/pagamentos" className="text-sm text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <ul className="mt-3 divide-y">
            {data.recentEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {EVENT_LABELS[event.type] ?? event.type}
                    {event.plan ? ` · ${PLANS[event.plan].name}` : ""}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {formatDateTime(event.createdAt)}
                  </p>
                </div>
                <span className="num shrink-0 text-sm font-medium">
                  {event.type === "cancelled" ? "—" : brlFromCents(event.amount)}
                </span>
              </li>
            ))}
            {data.recentEvents.length === 0 && (
              <li className="py-2.5 text-sm text-muted-foreground">
                Nenhum pagamento registrado ainda.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
