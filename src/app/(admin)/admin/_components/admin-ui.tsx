import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Plan } from "@/generated/prisma/client";
import { resolveAccess } from "@/utils/permissions/access";
import { PLANS } from "@/utils/plans";

export const brl = (reais: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    reais,
  );

export const brlFromCents = (cents: number | null | undefined) =>
  brl((cents ?? 0) / 100);

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function PlanBadge({ plan }: { plan: Plan | null | undefined }) {
  if (!plan) return <Badge variant="neutral">—</Badge>;
  return <Badge variant="info">{PLANS[plan].name}</Badge>;
}

type AccessUser = Parameters<typeof resolveAccess>[0];
type AccessSubscription = Parameters<typeof resolveAccess>[1];

/** Situação de acesso do usuário: plano pago, meses de indicação, teste ou expirado. */
export function AccessBadge({
  user,
  subscription,
  blocked,
}: {
  user: AccessUser;
  subscription: AccessSubscription;
  blocked?: boolean;
}) {
  if (blocked) return <Badge variant="danger">Bloqueado</Badge>;

  const access = resolveAccess(user, subscription);
  switch (access.kind) {
    case "ACTIVE":
      return <Badge variant="success">Assinante</Badge>;
    case "BONUS":
      return <Badge variant="info">Meses grátis</Badge>;
    case "TRIAL":
      return <Badge variant="warning">Em teste</Badge>;
    default:
      return <Badge variant="neutral">Expirado</Badge>;
  }
}

export function SearchForm({
  action,
  defaultValue,
  placeholder,
}: {
  action: string;
  defaultValue?: string;
  placeholder: string;
}) {
  return (
    <form action={action} method="get" className="flex gap-2" role="search">
      <div className="relative flex-1">
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-9"
        />
      </div>
      <Button type="submit" variant="outline">
        Buscar
      </Button>
    </form>
  );
}

export function Pagination({
  basePath,
  page,
  pages,
  total,
  params = {},
}: {
  basePath: string;
  page: number;
  pages: number;
  total: number;
  params?: Record<string, string | undefined>;
}) {
  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value);
    }
    search.set("page", String(target));
    return `${basePath}?${search.toString()}`;
  };

  return (
    <nav
      aria-label="Paginação"
      className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
    >
      <p>
        {total} {total === 1 ? "registro" : "registros"} · página {page} de{" "}
        {pages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page - 1)}>
              <ChevronLeft aria-hidden /> Anterior
            </Link>
          </Button>
        ) : null}
        {page < pages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page + 1)}>
              Próxima <ChevronRight aria-hidden />
            </Link>
          </Button>
        ) : null}
      </div>
    </nav>
  );
}
