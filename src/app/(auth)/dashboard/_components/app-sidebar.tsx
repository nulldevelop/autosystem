import { addDays, isAfter } from "date-fns";
import {
  BarChart3,
  Bell,
  Car,
  CreditCard,
  LayoutDashboard,
  Package,
  Send,
  Settings,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/getSession";
import { planRoutes, trialRoutes } from "@/utils/permissions/plan-features";
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits";
import { getBudgetsCount } from "../_data-access/get-budgets-count";
import { getCustomersCount } from "../_data-access/get-customers-count";
import { getSubscription } from "../_data-access/get-subscriptio";
import { getVehiclesCount } from "../_data-access/get-vehicles-count";
import { getProductsCount } from "../product/_data-access/get-products-count";
import { getServiceOrdersCount } from "../service/_data-access/get-service-orders-count";

type MenuItem = {
  title: string;
  url: string;
  icon: any;
  color?: string;
  badge?: number;
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getSession();

  let allowedRoutes: string[] = [];

  const [
    subscription,
    customersCount,
    vehiclesCount,
    budgetsCount,
    productsCount,
    serviceOrdersCount,
  ] = await Promise.all([
    session?.user?.id ? getSubscription(session.user.id) : null,
    getCustomersCount(),
    getVehiclesCount(),
    getBudgetsCount(),
    getProductsCount(),
    getServiceOrdersCount(),
  ]);

  if (session) {
    if (subscription && subscription.status === "active") {
      allowedRoutes = planRoutes[subscription.plan] || [];
    } else {
      const trialEndDate = addDays(
        new Date(session.user.createdAt),
        TRIAL_DAYS,
      );
      if (!isAfter(new Date(), trialEndDate)) {
        allowedRoutes = trialRoutes;
      }
    }
  }

  const allGestaoItems: MenuItem[] = [
    {
      title: "Orçamentos",
      url: "/dashboard/budget",
      icon: Send,
      color: "text-primary",
      badge: budgetsCount > 0 ? budgetsCount : undefined,
    },
    {
      title: "Ordens de Serviço",
      url: "/dashboard/service",
      icon: Wrench,
      badge: serviceOrdersCount > 0 ? serviceOrdersCount : undefined,
    },
    {
      title: "Financeiro",
      url: "/dashboard/financeiro",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Estoque",
      url: "/dashboard/product",
      icon: Package,
      badge: productsCount > 0 ? productsCount : undefined,
    },
    {
      title: "Clientes",
      url: "/dashboard/customer",
      icon: Users,
      badge: customersCount > 0 ? customersCount : undefined,
    },
    {
      title: "Veículos",
      url: "/dashboard/vehicle",
      icon: Car,
      badge: vehiclesCount > 0 ? vehiclesCount : undefined,
    },
  ].filter((item) => allowedRoutes.includes(item.url));

  const menuGroups = [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Relatórios",
          url: "/dashboard/relatorios",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Operacional",
      items: allGestaoItems,
    },
    {
      title: "Configurações",
      items: [
        { title: "Notificações", url: "/dashboard/notificacoes", icon: Bell },
        {
          title: "Oficina / Ajustes",
          url: "/dashboard/config",
          icon: Settings,
        },
        { title: "Assinatura", url: "/dashboard/plans", icon: CreditCard },
      ],
    },
  ];

  return (
    <Sidebar className="bg-[#0a0a0a] border-r border-white/5" {...props}>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="grid flex-1 text-left">
            <span className="text-xl font-black italic tracking-tighter text-white">
              AUTO<span className="text-primary">SYSTEM</span>
            </span>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                Performance UI
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 gap-2">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="text-white/20 text-[10px] uppercase tracking-[0.2em] px-4 py-4 font-black">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="transition-all duration-300 group py-6 rounded-xl hover:bg-white/[0.03] active:scale-95"
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-4 px-4"
                      >
                        <item.icon
                          className={`size-5 transition-all duration-300 ${
                            item.color ||
                            "text-white/40 group-hover:text-primary group-data-active:text-primary group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                          }`}
                        />
                        <span className="font-bold tracking-tight text-sm text-white/60 group-hover:text-white transition-colors">
                          {item.title}
                        </span>
                        {item.badge && item.badge > 0 && (
                          <span className="ml-auto flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-black text-primary glow-primary">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
