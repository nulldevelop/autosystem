import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* Peças que espelham o layout real das telas (PageHeader, StatCard, listas). */

export function PageHeaderSkeleton({ actions = 1 }: { actions?: number }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 sm:h-9" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {Array.from({ length: actions }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
          <Skeleton key={i} className="h-10 w-full rounded-lg sm:w-36" />
        ))}
      </div>
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
          key={i}
          className="space-y-3 rounded-xl border bg-card p-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function ToolbarSkeleton({ tabs = true }: { tabs?: boolean }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <Skeleton className="h-10 flex-1 rounded-lg" />
      {tabs && <Skeleton className="h-11 w-full rounded-lg lg:w-80" />}
    </div>
  );
}

/** Linha de lista com selo, título, placa/veículo, total e rodapé de ações. */
export function RowCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
          key={i}
          className="overflow-hidden rounded-xl border bg-card"
        >
          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-6 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24 rounded-[5px]" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-7 w-28" />
          </div>
          <div className="flex gap-2 border-t bg-surface px-4 py-3 sm:px-5">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Grade de cartões (clientes, veículos, produtos). */
export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
          key={i}
          className="overflow-hidden rounded-xl border bg-card"
        >
          <div className="flex items-start gap-3 p-4">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40 max-w-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="space-y-2 px-4 pb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-2 border-t bg-surface p-3">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Lista compacta em um único cartão (financeiro, pendentes do dashboard). */
export function DividedListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y overflow-hidden rounded-xl border bg-card">
      {Array.from({ length: count }).map((_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
          key={i}
          className="flex items-center justify-between gap-4 p-4"
        >
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Cabeçalho + coluna de cartões + tabela de itens (telas de detalhe). */
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-7 w-72 max-w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
