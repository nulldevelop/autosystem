import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProductStatsProps {
  products: any[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const totalProducts = products.length;
  const lowStock = products.filter(
    (p) => p.stockQuantity <= p.minStock && p.stockQuantity > 0,
  ).length;
  const outOfStock = products.filter((p) => p.stockQuantity === 0).length;
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.price * p.stockQuantity,
    0,
  );

  const stats = [
    {
      label: "Total de Itens",
      value: totalProducts,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Estoque Baixo",
      value: lowStock,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Esgotados",
      value: outOfStock,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Valor em Estoque",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(totalInventoryValue),
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 md:overflow-visible md:grid md:grid-cols-2 lg:grid-cols-4 md:pb-0 md:mx-0 md:px-0">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="min-w-[140px] md:min-w-0 border-white/5 bg-white/[0.02] shrink-0 md:shrink"
        >
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 truncate">
                  {stat.label}
                </p>
                <h3 className="text-lg md:text-2xl font-black italic text-white tracking-tighter truncate">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-2 md:p-3 rounded-xl shrink-0 ${stat.bgColor}`}>
                <stat.icon className={`size-4 md:size-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
