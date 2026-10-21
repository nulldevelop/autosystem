import { Badge } from "@/components/ui/badge";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const BUDGET_STATUS: Record<string, { label: string; variant: BadgeVariant }> =
  {
    pending: { label: "Pendente", variant: "warning" },
    aproved: { label: "Aprovado", variant: "success" },
    rejected: { label: "Rejeitado", variant: "danger" },
  };

export function BudgetStatusBadge({ status }: { status: string }) {
  const cfg = BUDGET_STATUS[status] ?? {
    label: status,
    variant: "neutral" as BadgeVariant,
  };
  return (
    <Badge variant={cfg.variant}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {cfg.label}
    </Badge>
  );
}

const SERVICE_STATUS: Record<string, { label: string; variant: BadgeVariant }> =
  {
    open: { label: "Aberta", variant: "info" },
    in_progress: { label: "Em andamento", variant: "warning" },
    completed: { label: "Concluída", variant: "success" },
    canceled: { label: "Cancelada", variant: "danger" },
  };

export function ServiceStatusBadge({ status }: { status: string }) {
  const cfg = SERVICE_STATUS[status] ?? {
    label: status,
    variant: "neutral" as BadgeVariant,
  };
  return (
    <Badge variant={cfg.variant}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {cfg.label}
    </Badge>
  );
}
