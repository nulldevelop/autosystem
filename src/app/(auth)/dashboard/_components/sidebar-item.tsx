"use client";

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
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface SidebarItemProps {
  item: {
    title: string;
    url: string;
    iconName: string;
    badge?: number;
  };
}

export function SidebarItem({ item }: SidebarItemProps) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();
  const isActive =
    item.url === "/dashboard"
      ? pathname === item.url
      : pathname.startsWith(item.url);
  const IconComponent = iconMap[item.iconName];

  return (
    <Link
      href={item.url}
      onClick={() => isMobile && setOpenMobile(false)}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-foreground before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-r-full before:bg-primary"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
      )}
    >
      {IconComponent && (
        <IconComponent
          className={cn("size-4 shrink-0", isActive && "text-primary")}
        />
      )}
      <span className="truncate">{item.title}</span>
      {item.badge && item.badge > 0 ? (
        <span className="num ml-auto rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
