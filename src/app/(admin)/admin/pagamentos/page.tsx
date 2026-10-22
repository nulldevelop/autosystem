import { Receipt } from "lucide-react";
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
import { listBillingEvents } from "@/lib/admin/queries";
import {
  brlFromCents,
  formatDateTime,
  Pagination,
  PlanBadge,
} from "../_components/admin-ui";

type SearchParams = Promise<{ page?: string }>;

const EVENT: Record<string, { label: string; variant: "success" | "info" | "danger" }> = {
  completed: { label: "Nova assinatura", variant: "success" },
  renewed: { label: "Renovação", variant: "info" },
  cancelled: { label: "Cancelamento", variant: "danger" },
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const { page, skip, take } = parsePage(params.page);
  const { items, total } = await listBillingEvents({ skip, take });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pagamentos"
        description="Cada cobrança e cancelamento recebido da AbacatePay, do mais recente ao mais antigo."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhum pagamento registrado"
          description="Os eventos aparecem aqui assim que o webhook da AbacatePay os envia."
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Cobrança</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((event) => {
                const info = EVENT[event.type] ?? {
                  label: event.type,
                  variant: "info" as const,
                };
                return (
                  <TableRow key={event.id}>
                    <TableCell>{formatDateTime(event.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={info.variant}>{info.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {event.user ? (
                        <>
                          <p className="text-sm">{event.user.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.user.email}
                          </p>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={event.plan} />
                    </TableCell>
                    <TableCell>
                      {event.interval === "yearly"
                        ? "Anual"
                        : event.interval === "monthly"
                          ? "Mensal"
                          : "—"}
                    </TableCell>
                    <TableCell className="num text-right">
                      {event.type === "cancelled" ? "—" : brlFromCents(event.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        basePath="/admin/pagamentos"
        page={page}
        pages={totalPages(total)}
        total={total}
      />
    </div>
  );
}
