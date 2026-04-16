"use client";

import {
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BudgetWithRelations } from "@/types/budget";

interface BudgetStatsProps {
  budgets: BudgetWithRelations[];
}

export function BudgetStats({ budgets }: BudgetStatsProps) {
  const stats = {
    total: budgets.length,
    pending: budgets.filter((b) => b.status === "pending").length,
    approved: budgets.filter((b) => b.status === "aproved").length,
    rejected: budgets.filter((b) => b.status === "rejected").length,
    totalAmount: budgets.reduce((acc, b) => acc + b.totalAmount, 0),
    approvedAmount: budgets
      .filter((b) => b.status === "aproved")
      .reduce((acc, b) => acc + b.totalAmount, 0),
  };

  const items = [
    {
      label: "Total de Orçamentos",
      value: stats.total,
      subValue: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats.totalAmount),
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Aguardando Aprovação",
      value: stats.pending,
      subValue: "Pendente",
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Orçamentos Aprovados",
      value: stats.approved,
      subValue: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats.approvedAmount),
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Taxa de Conversão",
      value:
        stats.total > 0
          ? `${Math.round((stats.approved / stats.total) * 100)}%`
          : "0%",
      subValue: "Média Global",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card
          key={index}
          className={cn(
            "p-5 bg-zinc-950/50 border-white/5 backdrop-blur-sm group hover:border-white/10 transition-all duration-300",
            "relative overflow-hidden",
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-2xl",
                item.bg,
                item.color,
                "border",
                item.border,
              )}
            >
              <item.icon className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                {item.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black italic uppercase tracking-tighter text-white">
                  {item.value}
                </span>
                <span className="text-[10px] font-bold text-white/20 uppercase">
                  {item.subValue}
                </span>
              </div>
            </div>
          </div>

          {/* Decorative Background Icon */}
          <item.icon className="absolute -right-4 -bottom-4 size-24 text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
      ))}
    </div>
  );
}
