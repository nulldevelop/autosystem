import { addDays, isAfter } from "date-fns";
import {
  BarChart3,
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
import { Logo } from "@/components/ui/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
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
import { SidebarItem } from "./sidebar-item";

type MenuItem = {
  title: string;
  url: string;
  iconName: string;
  badge?: number;
};

// biome-ignore lint/suspicious/noExplicitAny: Icon component mapping
const _iconMap: Record<string, any> = {
  LayoutDashboard,
  BarChart3,
  Send,
  Wrench,
  TrendingUp,
  Package,
  Users,
  Car,
  CreditCard,
  Settings,
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getSession();
  const orgId = session?.session?.activeOrganizationId || "";
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
    getCustomersCount(orgId),
    getVehiclesCount(orgId),
    getBudgetsCount(orgId),
    getProductsCount(orgId),
    getServiceOrdersCount(orgId),
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
      iconName: "Send",
      badge: budgetsCount > 0 ? budgetsCount : undefined,
    },
    {
      title: "Ordens de Serviço",
      url: "/dashboard/service",
      iconName: "Wrench",
      badge: serviceOrdersCount > 0 ? serviceOrdersCount : undefined,
    },
    {
      title: "Financeiro",
      url: "/dashboard/financeiro",
      iconName: "TrendingUp",
    },
    {
      title: "Estoque",
      url: "/dashboard/product",
      iconName: "Package",
      badge: productsCount > 0 ? productsCount : undefined,
    },
    {
      title: "Clientes",
      url: "/dashboard/customer",
      iconName: "Users",
      badge: customersCount > 0 ? customersCount : undefined,
    },
    {
      title: "Veículos",
      url: "/dashboard/vehicle",
      iconName: "Car",
      badge: vehiclesCount > 0 ? vehiclesCount : undefined,
    },
  ].filter((item) => allowedRoutes.includes(item.url));

  const menuGroups = [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", iconName: "LayoutDashboard" },
        {
          title: "Relatórios",
          url: "/dashboard/relatorios",
          iconName: "BarChart3",
        },
      ],
    },
    {
      title: "Gestão",
      items: allGestaoItems,
    },
    {
      title: "Sistema",
      items: [
        { title: "Planos", url: "/dashboard/plans", iconName: "CreditCard" },
        {
          title: "Configurações",
          url: "/dashboard/config",
          iconName: "Settings",
        },
      ],
    },
  ];

  return (
    <Sidebar {...props} className="bg-[#0a0a0a] border-r border-white/5">
      <SidebarHeader className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Logo className="size-8" />
          <span className="text-xl font-black italic tracking-tighter text-white">
            AUTO<span className="text-primary">SYSTEM</span>
          </span>
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
                    <SidebarItem item={item} />
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
