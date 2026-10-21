"use client";

import { Calendar, Car, Factory, Gauge } from "lucide-react";
import { StatCard } from "@/components/app/stat-card";
import type { Vehicle } from "@/generated/prisma/client";

interface VehicleStatsProps {
  vehicles: Vehicle[];
}

export function VehicleStats({ vehicles }: VehicleStatsProps) {
  const currentYear = new Date().getFullYear();
  const total = vehicles.length;
  const recent = vehicles.filter((v) => v.year >= currentYear - 5).length;

  const brandCount = vehicles.reduce<Record<string, number>>((acc, v) => {
    acc[v.marca] = (acc[v.marca] || 0) + 1;
    return acc;
  }, {});
  const topBrand =
    Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const averageYear = total
    ? Math.round(vehicles.reduce((acc, v) => acc + v.year, 0) / total)
    : null;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Veículos"
        value={total}
        hint="Cadastrados"
        icon={Car}
        tone="info"
      />
      <StatCard
        label="Últimos 5 anos"
        value={recent}
        hint="Modelos recentes"
        icon={Calendar}
        tone="primary"
      />
      <StatCard
        label="Marca mais comum"
        value={topBrand}
        hint={
          topBrand === "—"
            ? undefined
            : `${brandCount[topBrand]} ${brandCount[topBrand] === 1 ? "veículo" : "veículos"}`
        }
        icon={Factory}
        tone="primary"
      />
      <StatCard
        label="Ano médio"
        value={averageYear ?? "—"}
        hint="Da frota cadastrada"
        icon={Gauge}
        tone="neutral"
      />
    </div>
  );
}
