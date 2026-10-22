import { Users } from "lucide-react";
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
import { listUsers } from "@/lib/admin/queries";
import { UserActions } from "../_components/user-actions";
import {
  AccessBadge,
  formatDate,
  Pagination,
  PlanBadge,
  SearchForm,
} from "../_components/admin-ui";

type SearchParams = Promise<{ q?: string; page?: string }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const { page, skip, take } = parsePage(params.page);
  const { items, total } = await listUsers({ q: params.q, skip, take });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Usuários"
        description="Contas, situação do teste ou plano e ações de suporte."
      />

      <SearchForm
        action="/admin/usuarios"
        defaultValue={params.q}
        placeholder="Buscar por nome ou e-mail"
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum usuário encontrado"
          description="Ajuste a busca para ver outros usuários."
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Oficina</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead>Gerenciar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((user) => {
                const org = user.members[0]?.organization;
                const subscription = user.subscription;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {user.name || "Sem nome"}
                        </span>
                        {user.role === "admin" && (
                          <Badge variant="warning">admin</Badge>
                        )}
                        {!user.emailVerified && (
                          <Badge variant="neutral">e-mail pendente</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      {org ? (
                        <Link
                          href={`/admin/oficinas/${org.id}`}
                          className="text-primary hover:underline"
                        >
                          {org.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Ainda sem oficina</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AccessBadge
                        user={user}
                        subscription={subscription}
                        blocked={Boolean(user.blockedAt)}
                      />
                    </TableCell>
                    <TableCell>
                      <PlanBadge
                        plan={subscription?.status === "active" ? subscription.plan : null}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="min-w-56">
                      <details>
                        <summary className="cursor-pointer text-sm font-medium text-primary">
                          Abrir
                        </summary>
                        <UserActions
                          userId={user.id}
                          email={user.email}
                          blocked={Boolean(user.blockedAt)}
                          hasActiveSubscription={subscription?.status === "active"}
                          isAdmin={user.role === "admin"}
                        />
                      </details>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        basePath="/admin/usuarios"
        page={page}
        pages={totalPages(total)}
        total={total}
        params={{ q: params.q }}
      />
    </div>
  );
}
