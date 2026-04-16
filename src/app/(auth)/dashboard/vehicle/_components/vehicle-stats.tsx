"use client";

import { Calendar, Car, Fuel, History, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Vehicle } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

interface VehicleStatsProps {
  vehicles: Vehicle[];
}

export function VehicleStats({ vehicles }: VehicleStatsProps) {
  const currentYear = new Date().getFullYear();

  const stats = {
    total: vehicles.length,
    newerThanFiveYears: vehicles.filter((v) => v.year >= currentYear - 5)
      .length,
    mostCommonBrand: vehicles.reduce(
      (acc, v) => {
        acc[v.marca] = (acc[v.marca] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  const topBrand =
    Object.entries(stats.mostCommonBrand).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "N/A";

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
                <span
                  className={cn(
                    "font-black italic uppercase tracking-tighter text-white",
                    typeof item.value === "string"
                      ? "text-base md:text-xl"
                      : "text-lg md:text-2xl",
                  )}
                >
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
