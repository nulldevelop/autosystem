import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
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
import { listAuditLogs } from "@/lib/admin/queries";
import { formatDateTime, Pagination } from "../_components/admin-ui";

type SearchParams = Promise<{ page?: string }>;

const ACTION_LABELS: Record<string, string> = {
  GRANT_FREE_DAYS: "Dias grátis concedidos",
  CANCEL_SUBSCRIPTION: "Assinatura cancelada",
  BLOCK_USER: "Usuário bloqueado",
  UNBLOCK_USER: "Usuário desbloqueado",
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const { page, skip, take } = parsePage(params.page);
  const { items, total } = await listAuditLogs({ skip, take });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Auditoria"
        description="Tudo o que foi feito pelo painel: quem, quando e em quem."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Nenhuma ação registrada"
          description="As ações feitas no painel aparecem aqui."
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Administrador</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Alvo</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>{log.admin?.email ?? log.adminId}</TableCell>
                  <TableCell>{ACTION_LABELS[log.action] ?? log.action}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.targetType}:{log.targetId.slice(0, 8)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        basePath="/admin/auditoria"
        page={page}
        pages={totalPages(total)}
        total={total}
      />
    </div>
  );
}
