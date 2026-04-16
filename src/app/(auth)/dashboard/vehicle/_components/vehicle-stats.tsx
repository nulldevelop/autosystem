"use client";

import { Card } from "@/components/ui/card";
import { 
  Car, 
  Calendar, 
  History, 
  TrendingUp,
  Fuel
} from "lucide-react";
import type { Vehicle } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

interface VehicleStatsProps {
  vehicles: Vehicle[];
}

export function VehicleStats({ vehicles }: VehicleStatsProps) {
  const currentYear = new Date().getFullYear();
  
  const stats = {
    total: vehicles.length,
    newerThanFiveYears: vehicles.filter(v => v.year >= currentYear - 5).length,
    mostCommonBrand: vehicles.reduce((acc, v) => {
        acc[v.marca] = (acc[v.marca] || 0) + 1;
        return acc;
    }, {} as Record<string, number>),
  };

  const topBrand = Object.entries(stats.mostCommonBrand).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const items = [
    {
      label: "Total de Veículos",
      value: stats.total,
      subValue: "Frota Cadastrada",
      icon: Car,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Veículos Novos",
      value: stats.newerThanFiveYears,
      subValue: "Últimos 5 Anos",
      icon: Calendar,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Marca Dominante",
      value: topBrand,
      subValue: "Maior Volume",
      icon: History,
      color: "text-primary",
      bg: "bg-primary/10",
      border: "border-primary/20",
    },
    {
      label: "Manutenções",
      value: "92%",
      subValue: "Eficiência Técnica",
      icon: TrendingUp,
      color: "text-secondary",
      bg: "bg-secondary/10",
      border: "border-secondary/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card
          key={index}
          className={cn(
            "p-5 bg-zinc-950/50 border-white/5 backdrop-blur-sm group hover:border-white/10 transition-all duration-300",
            "relative overflow-hidden"
          )}
        >
          <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", item.bg, item.color, "border", item.border)}>
              <item.icon className="size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                {item.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                    "font-black italic uppercase tracking-tighter text-white",
                    typeof item.value === 'string' ? "text-xl" : "text-2xl"
                )}>
                  {item.value}
                </span>
                <span className="text-[10px] font-bold text-white/20 uppercase">
                  {item.subValue}
                </span>
              </div>
            </div>
          </div>
          <item.icon className="absolute -right-4 -bottom-4 size-24 text-white/[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </Card>
      ))}
    </div>
  );
}
