import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/admin/guard";
import { getOrganizationDetail } from "@/lib/admin/queries";
import { UserActions } from "../../_components/user-actions";
import {
  AccessBadge,
  brl,
  formatDate,
  PlanBadge,
} from "../../_components/admin-ui";

const BUDGET_STATUS: Record<string, string> = {
  pending: "Pendente",
  aproved: "Aprovado",
  rejected: "Rejeitado",
};

export default async function AdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const detail = await getOrganizationDetail(id);
  if (!detail) notFound();

  const { organization, paidIncome, recentBudgets } = detail;
  const counts = organization._count;

  const facts = [
    ["CNPJ", organization.cnpj],
    ["Telefone", organization.phone],
    ["Endereço", organization.address],
    ["Criada em", formatDate(organization.createdAt)],
    ["Identificador", organization.slug],
  ];

  const usage = [
    ["Clientes", counts.customers],
    ["Veículos", counts.vehicles],
    ["Produtos", counts.products],
    ["Orçamentos", counts.budgets],
    ["Ordens de serviço", counts.serviceOrders],
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title={organization.name}
        eyebrow={
          <Link href="/admin/oficinas" className="hover:underline">
            ← Oficinas
          </Link>
        }
        description={`Faturamento registrado pela oficina: ${brl(paidIncome)}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="facts-title" className="rounded-xl border bg-card p-4 sm:p-5">
          <h2 id="facts-title" className="text-base font-semibold">
            Dados cadastrais
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="usage-title" className="rounded-xl border bg-card p-4 sm:p-5">
          <h2 id="usage-title" className="text-base font-semibold">
            Uso
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {usage.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="num text-2xl font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section aria-labelledby="members-title" className="space-y-3">
        <h2 id="members-title" className="text-base font-semibold">
          Membros
        </h2>
        <ul className="space-y-3">
          {organization.members.map((member) => {
            const user = member.user;
            const subscription = user.subscription;
            return (
              <li key={member.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{user.name || "Sem nome"}</p>
                  <Badge variant="neutral">{member.role}</Badge>
                  {user.role === "admin" && <Badge variant="warning">admin</Badge>}
                  <AccessBadge
                    user={user}
                    subscription={subscription}
                    blocked={Boolean(user.blockedAt)}
                  />
                  {subscription?.status === "active" && (
                    <PlanBadge plan={subscription.plan} />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">Cadastro:</dt>
                    <dd>{formatDate(user.createdAt)}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">E-mail confirmado:</dt>
                    <dd>{user.emailVerified ? "Sim" : "Não"}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">Vencimento:</dt>
                    <dd>{formatDate(subscription?.currentPeriodEnd)}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-muted-foreground">Grátis até:</dt>
                    <dd>{formatDate(subscription?.bonusUntil)}</dd>
                  </div>
                </dl>
                <details className="mt-2 border-t pt-2">
                  <summary className="cursor-pointer text-sm font-medium text-primary">
                    Gerenciar
                  </summary>
                  <UserActions
                    userId={user.id}
                    email={user.email}
                    blocked={Boolean(user.blockedAt)}
                    hasActiveSubscription={subscription?.status === "active"}
                    isAdmin={user.role === "admin"}
                  />
                </details>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="budgets-title" className="rounded-xl border bg-card p-4 sm:p-5">
        <h2 id="budgets-title" className="text-base font-semibold">
          Últimos orçamentos
        </h2>
        <ul className="mt-3 divide-y">
          {recentBudgets.map((budget) => (
            <li key={budget.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted-foreground">
                {formatDate(budget.createdAt)} ·{" "}
                {BUDGET_STATUS[budget.status] ?? budget.status}
              </span>
              <span className="num font-medium">{brl(budget.totalAmount)}</span>
            </li>
          ))}
          {recentBudgets.length === 0 && (
            <li className="py-2.5 text-sm text-muted-foreground">
              Nenhum orçamento ainda.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
