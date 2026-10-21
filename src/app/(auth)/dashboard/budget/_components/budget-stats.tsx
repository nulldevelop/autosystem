"use client";

import { CheckCircle2, Clock, FileText, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/app/stat-card";
import type { BudgetWithRelations } from "@/types/budget";

interface BudgetStatsProps {
  budgets: BudgetWithRelations[];
}

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function BudgetStats({ budgets }: BudgetStatsProps) {
  const total = budgets.length;
  const pending = budgets.filter((b) => b.status === "pending").length;
  const approved = budgets.filter((b) => b.status === "aproved");
  const approvedAmount = approved.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalAmount = budgets.reduce((acc, b) => acc + b.totalAmount, 0);
  const conversion =
    total > 0 ? Math.round((approved.length / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Orçamentos"
        value={total}
        hint={brl(totalAmount)}
        icon={FileText}
        tone="info"
      />
      <StatCard
        label="Aguardando"
        value={pending}
        hint="Sem resposta do cliente"
        icon={Clock}
        tone="warning"
      />
      <StatCard
        label="Aprovados"
        value={approved.length}
        hint={brl(approvedAmount)}
        icon={CheckCircle2}
        tone="primary"
      />
      <StatCard
        label="Conversão"
        value={`${conversion}%`}
        hint="Aprovados ÷ total"
        icon={TrendingUp}
        tone="primary"
      />
    </div>
  );
}
