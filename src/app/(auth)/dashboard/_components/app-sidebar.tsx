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
import { prisma } from "@/lib/prisma";
import { resolveAccess } from "@/utils/permissions/access";
import { planRoutes, trialRoutes } from "@/utils/permissions/plan-features";
import { getBudgetsCount } from "../_data-access/get-budgets-count";
import { getCustomersCount } from "../_data-access/get-customers-count";
import { getSubscription } from "../_data-access/get-subscription";
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
  Bell,
};

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await getSession();
  const orgId = session?.session?.activeOrganizationId || "";
  let allowedRoutes: string[] = [];

  let unreadNotifications = 0;
  try {
    if (orgId && typeof orgId === "string" && orgId.length > 0) {
      unreadNotifications = await prisma.notification.count({
        where: { organizationId: orgId, read: false },
      });
    }
  } catch {
    unreadNotifications = 0;
  }

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
    getVehiclesCount(orgId),
    getBudgetsCount(),
    getProductsCount(orgId),
    getServiceOrdersCount(orgId),
  ]);

  if (session) {
    const access = resolveAccess(session.user.createdAt, subscription);
    if (access.plan) {
      allowedRoutes = planRoutes[access.plan] || [];
    } else if (access.kind === "TRIAL") {
      allowedRoutes = trialRoutes;
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

  const notificationsItem: MenuItem = {
    title: "Notificações",
    url: "/dashboard/notifications",
    iconName: "Bell",
    badge: unreadNotifications > 0 ? unreadNotifications : undefined,
  };

  const menuGroups = [
    {
      title: "Visão geral",
      items: [
        { title: "Dashboard", url: "/dashboard", iconName: "LayoutDashboard" },
        {
          title: "Relatórios",
          url: "/dashboard/relatorios",
          iconName: "BarChart3",
        },
        {
          title: "Financeiro",
          url: "/dashboard/financeiro",
          iconName: "TrendingUp",
        },
        notificationsItem,
      ],
    },
    {
      title: "Operação",
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
    <Sidebar {...props} className="bg-sidebar border-r border-sidebar-border">
      <SidebarHeader className="h-16 justify-center border-b border-sidebar-border px-5">
        <div className="flex items-center gap-3">
          <Logo className="size-8" />
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            Auto<span className="text-primary">System</span>
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-3 px-3 py-4">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title} className="p-0">
            <SidebarGroupLabel className="px-3 py-2 text-xs font-medium text-muted-foreground/80">
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
