import { Wallet } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdminPage } from "@/lib/admin/guard";
import { parsePage, totalPages } from "@/lib/admin/metrics";
import {
  listSubscriptions,
  parseSubscriptionFilter,
  type SubscriptionFilter,
} from "@/lib/admin/queries";
import { cn } from "@/lib/utils";
import { formatDate, Pagination, PlanBadge } from "../_components/admin-ui";

type SearchParams = Promise<{ filter?: string; page?: string }>;

const FILTERS: { value: SubscriptionFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Ativas" },
  { value: "canceled", label: "Canceladas" },
  { value: "bonus", label: "Com meses grátis" },
];

function StatusBadge({ status }: { status: string | null }) {
  if (status === "active") return <Badge variant="success">Ativa</Badge>;
  if (status === "canceled") return <Badge variant="danger">Cancelada</Badge>;
  return <Badge variant="neutral">Sem pagamento</Badge>;
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const filter = parseSubscriptionFilter(params.filter);
  const { page, skip, take } = parsePage(params.page);
  const { items, total } = await listSubscriptions({ filter, skip, take });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Assinaturas"
        description="Estado de cada assinatura e meses grátis concedidos."
      />

      <nav aria-label="Filtros" className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/assinaturas?filter=${f.value}`}
            aria-current={filter === f.value ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              filter === f.value
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Nenhuma assinatura neste filtro"
          description="Tente outro filtro."
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Cobrança</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Grátis até</TableHead>
                <TableHead>ID AbacatePay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <p className="font-medium">{sub.user.name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground">{sub.user.email}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={sub.status === "active" ? sub.plan : null} />
                  </TableCell>
                  <TableCell>
                    {sub.pendingInterval === "yearly"
                      ? "Anual"
                      : sub.pendingInterval === "monthly"
                        ? "Mensal"
                        : "—"}
                  </TableCell>
                  <TableCell>{formatDate(sub.currentPeriodEnd)}</TableCell>
                  <TableCell>{formatDate(sub.bonusUntil)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {sub.abacatepaySubscriptionId ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        basePath="/admin/assinaturas"
        page={page}
        pages={totalPages(total)}
        total={total}
        params={{ filter }}
      />
    </div>
  );
}
