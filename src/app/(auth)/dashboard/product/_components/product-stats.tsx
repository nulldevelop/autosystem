import { Card, CardContent } from "@/components/ui/card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

interface ProductStatsProps {
  products: any[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stockQuantity <= p.minStock && p.stockQuantity > 0).length;
  const outOfStock = products.filter(p => p.stockQuantity === 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stockQuantity), 0);

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-black italic text-white tracking-tighter">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
