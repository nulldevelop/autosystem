import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "primary" | "info" | "warning" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  info: "bg-info/12 text-info",
  warning: "bg-warning/12 text-warning",
  danger: "bg-destructive/12 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 rounded-xl border bg-card p-3.5 sm:p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            TONES[tone],
          )}
        >
          <Icon className="size-4" aria-hidden />
        </div>
      </div>
      <div className="min-w-0">
        <p className="num truncate font-display text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
          {value}
        </p>
        {hint && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
