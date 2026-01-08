import { addDays, isAfter } from "date-fns";
import {
  Car,
  FileText,
  Package,
  PlusCircle,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Imports de Permissão
import { getSession } from "@/lib/getSession";
import { planRoutes, trialRoutes } from "@/utils/permissions/plan-features"; // Importe os arrays de rotas
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits";
import { getBudgetsCount } from "../_data-access/get-budgets-count";
import { getCustomersCount } from "../_data-access/get-customers-count";
import { getVehiclesCount } from "../_data-access/get-vehicles-count";
import { getProductsCount } from "../product/_data-access/get-products-count";
import { getServiceOrdersCount } from "../service/_data-access/get-service-orders-count";
import { getSubscription } from "../_data-access/get-subscriptio";

export async function DashboardStats() {
  const session = await getSession();

  // 1. Buscas em paralelo (Counts + Assinatura)
  const [
    customersCount,
    vehiclesCount,
    budgetsCount,
    productsCount,
    serviceOrdersCount,
    subscription,
  ] = await Promise.all([
    getCustomersCount(),
    getVehiclesCount(),
    getBudgetsCount(),
    getProductsCount(),
    getServiceOrdersCount(),
    session?.user?.id ? getSubscription(session.user.id) : null,
  ]);

  let allowedRoutes: string[] = [];

  if (session) {
    if (subscription && subscription.status === "active") {
      allowedRoutes = planRoutes[subscription.plan] || [];
    } else {
      const trialEndDate = addDays(
        new Date(session.user.createdAt),
        TRIAL_DAYS,
      );
      if (!isAfter(new Date(), trialEndDate)) {
        allowedRoutes = trialRoutes || [
          "/dashboard/budget",
          "/dashboard/service",
          "/dashboard/customer",
          "/dashboard/vehicle",
          "/dashboard/product",
        ];
      }
    }
  }

  const stats = [
    {
      title: "Clientes",
      count: customersCount,
      icon: <Users className="h-6 w-6 text-gray-400" />,
      action: { href: "/dashboard/customer", label: "Ver Clientes" },
      quickAction: {
        href: "/dashboard/customer?create=true",
        label: "Novo Cliente",
      },
    },
    {
      title: "Veículos",
      count: vehiclesCount,
      icon: <Car className="h-6 w-6 text-gray-400" />,
      action: { href: "/dashboard/vehicle", label: "Ver Veículos" },
      quickAction: {
        href: "/dashboard/vehicle?create=true",
        label: "Novo Veículo",
      },
    },
    {
      title: "Orçamentos",
      count: budgetsCount,
      icon: <FileText className="h-6 w-6 text-gray-400" />,
      action: { href: "/dashboard/budget", label: "Ver Orçamentos" },
      quickAction: {
        href: "/dashboard/budget?create=true",
        label: "Novo Orçamento",
      },
    },
    {
      title: "Serviços",
      count: serviceOrdersCount,
      icon: <Wrench className="h-6 w-6 text-gray-400" />,
      action: { href: "/dashboard/service", label: "Ver Serviços" },
    },
    {
      title: "Produtos",
      count: productsCount,
      icon: <Package className="h-6 w-6 text-gray-400" />,
      action: { href: "/dashboard/product", label: "Ver Produtos" },
      quickAction: {
        href: "/dashboard/product?create=true",
        label: "Novo Produto",
      },
    },
  ];

  // 3. Filtrar apenas o que o usuário pode ver
  const visibleStats = stats.filter((stat) =>
    allowedRoutes.includes(stat.action.href),
  );

  if (visibleStats.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 mb-5 mt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-gray-900/50 border-gray-800 text-white"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stat.count}</div>
              <div className="flex justify-between items-center mt-4 gap-2">
                <Link href={stat.action.href} passHref>
                  <Button className="size-sm hover:bg-green-500/60">
                    {stat.action.label}
                  </Button>
                </Link>
                {stat.quickAction && (
                  <Link href={stat.quickAction.href} passHref>
                    <Button className="flex size-sm items-center gap-2 hover:bg-green-500/40">
                      <PlusCircle className="h-4 w-4" />
                      {stat.quickAction.label}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
