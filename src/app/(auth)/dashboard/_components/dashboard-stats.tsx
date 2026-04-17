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
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Imports de Permissão
import { getSession } from "@/lib/getSession";
import { planRoutes, trialRoutes } from "@/utils/permissions/plan-features"; // Importe os arrays de rotas
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits";
import { getBudgetsCount } from "../_data-access/get-budgets-count";
import { getCustomersCount } from "../_data-access/get-customers-count";
import { getSubscription } from "../_data-access/get-subscriptio";
import { getVehiclesCount } from "../_data-access/get-vehicles-count";
import { getProductsCount } from "../product/_data-access/get-products-count";
import { getServiceOrdersCount } from "../service/_data-access/get-service-orders-count";

export async function DashboardStats() {
  const session = await getSession();
  const orgId = session?.session?.activeOrganizationId || "";

  // 1. Buscas em paralelo (Counts + Assinatura)
  const [
    customersCount,
    vehiclesCount,
    budgetsCount,
    productsCount,
    serviceOrdersCount,
    subscription,
  ] = await Promise.all([
    getCustomersCount(orgId),
    getVehiclesCount(orgId),
    getBudgetsCount(orgId),
    getProductsCount(orgId),
    getServiceOrdersCount(orgId),
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
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleStats.map((stat) => (
          <Card
            key={stat.title}
            className="relative overflow-hidden group border-white/5 hover:border-primary/20 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-4 text-white/5 group-hover:text-primary/10 transition-colors duration-500">
              {stat.icon &&
                React.cloneElement(
                  stat.icon as React.ReactElement<{ className?: string }>,
                  { className: "size-16" },
                )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary transition-colors">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black italic tracking-tighter text-white mb-6 group-hover:translate-x-2 transition-transform duration-500">
                {stat.count.toString().padStart(2, "0")}
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <Link href={stat.action.href} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-8 px-3"
                  >
                    {stat.action.label}
                  </Button>
                </Link>
                {stat.quickAction && (
                  <Link href={stat.quickAction.href}>
                    <Button
                      variant="default"
                      size="icon-sm"
                      className="rounded-lg size-8 glow-primary"
                    >
                      <PlusCircle className="size-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-700" />
          </Card>
        ))}
      </div>
    </section>
  );
}
