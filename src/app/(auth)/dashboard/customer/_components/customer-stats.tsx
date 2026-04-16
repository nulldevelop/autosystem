"use client";

import { MapPin, TrendingUp, UserCheck, UserPlus, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Customer } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

interface CustomerStatsProps {
  customers: Customer[];
}

export function CustomerStats({ customers }: CustomerStatsProps) {
  const stats = {
    total: customers.length,
    newThisMonth: customers.filter((c) => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      return new Date(c.createdAt) >= startOfMonth;
    }).length,
    withPhone: customers.filter((c) => !!c.phone).length,
  };

  const items = [
    {
      label: "Total de Clientes",
      value: stats.total,
      subValue: "Base Geral",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Novos Clientes",
      value: stats.newThisMonth,
      subValue: "Este Mês",
      icon: UserPlus,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Contatos Ativos",
      value: stats.withPhone,
      subValue: `${Math.round((stats.withPhone / stats.total) * 100 || 0)}% da base`,
      icon: UserCheck,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Taxa de Retenção",
      value: "85%",
      subValue: "Média Global",
      icon: TrendingUp,
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0 md:mx-0 md:px-0">
      {items.map((item, index) => (
        <Card
          key={index}
          className={cn(
            "min-w-[160px] md:min-w-0 p-4 md:p-5 bg-zinc-950/50 border-white/5 backdrop-blur-sm group hover:border-white/10 transition-all duration-300 shrink-0 md:shrink",
            "relative overflow-hidden",
          )}
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div
              className={cn(
                "p-2 md:p-3 rounded-xl md:rounded-2xl",
                item.bg,
                item.color,
                "border",
                item.border,
              )}
            >
              <item.icon className="size-4 md:size-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 truncate">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1.5 md:gap-2">
                <span className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white">
                  {item.value}
                </span>
                <span className="text-[8px] md:text-[10px] font-bold text-white/20 uppercase truncate hidden sm:block">
                  {item.subValue}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
