import { Building2 } from "lucide-react";
import Link from "next/link";
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
import { listOrganizations } from "@/lib/admin/queries";
import {
  AccessBadge,
  formatDate,
  Pagination,
  PlanBadge,
  SearchForm,
} from "../_components/admin-ui";

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const { page, skip, take } = parsePage(params.page);
  const { items, total } = await listOrganizations({ q: params.q, skip, take });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Oficinas"
        description="Todas as oficinas cadastradas, com responsável, plano e uso."
      />

      <SearchForm
        action="/admin/oficinas"
        defaultValue={params.q}
        placeholder="Buscar por nome, CNPJ ou e-mail do responsável"
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma oficina encontrada"
          description="Ajuste a busca para ver outras oficinas."
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Oficina</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead className="text-right">Clientes</TableHead>
                <TableHead className="text-right">Orçamentos</TableHead>
                <TableHead className="text-right">O.S.</TableHead>
                <TableHead>Criada em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((org) => {
                const owner = org.members[0]?.user;
                return (
                  <TableRow key={org.id}>
                    <TableCell>
                      <Link
                        href={`/admin/oficinas/${org.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {org.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{org.slug}</p>
                    </TableCell>
                    <TableCell>
                      {owner ? (
                        <>
                          <p className="text-sm">{owner.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">
                            {owner.email}
                          </p>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {owner ? (
                        <AccessBadge
                          user={owner}
                          subscription={owner.subscription}
                          blocked={Boolean(owner.blockedAt)}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <PlanBadge
                        plan={
                          owner?.subscription?.status === "active"
                            ? owner.subscription.plan
                            : null
                        }
                      />
                    </TableCell>
                    <TableCell className="num text-right">
                      {org._count.customers}
                    </TableCell>
                    <TableCell className="num text-right">
                      {org._count.budgets}
                    </TableCell>
                    <TableCell className="num text-right">
                      {org._count.serviceOrders}
                    </TableCell>
                    <TableCell>{formatDate(org.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        basePath="/admin/oficinas"
        page={page}
        pages={totalPages(total)}
        total={total}
        params={{ q: params.q }}
      />
    </div>
  );
}
