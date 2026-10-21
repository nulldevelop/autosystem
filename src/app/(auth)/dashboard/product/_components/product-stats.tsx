"use client";

import { AlertTriangle, DollarSign, Package, PackageX } from "lucide-react";
import { StatCard } from "@/components/app/stat-card";
import type { Product } from "@/generated/prisma/client";

interface ProductStatsProps {
  products: Product[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const lowStock = products.filter(
    (p) => p.stockQuantity <= p.minStock && p.stockQuantity > 0,
  ).length;
  const outOfStock = products.filter((p) => p.stockQuantity === 0).length;
  const inventoryValue = products.reduce(
    (acc, p) => acc + p.price * p.stockQuantity,
    0,
  );

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Itens"
        value={products.length}
        hint="No catálogo"
        icon={Package}
        tone="info"
      />
      <StatCard
        label="Estoque baixo"
        value={lowStock}
        hint="Abaixo do mínimo"
        icon={AlertTriangle}
        tone="warning"
      />
      <StatCard
        label="Esgotados"
        value={outOfStock}
        hint="Sem unidades"
        icon={PackageX}
        tone="danger"
      />
      <StatCard
        label="Em estoque"
        value={new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(inventoryValue)}
        hint="Preço × quantidade"
        icon={DollarSign}
        tone="primary"
      />
    </div>
  );
}
