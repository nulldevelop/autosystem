"use client";

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
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";

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
  const isActive = pathname === item.url;
  const IconComponent = iconMap[item.iconName];

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Link
      href={item.url}
      onClick={handleClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-white/[0.03] text-white/40 hover:text-white"
      }`}
    >
      {IconComponent && (
        <IconComponent
          className={`size-5 transition-all duration-300 ${
            isActive ? "text-primary" : ""
          }`}
        />
      )}
      <span
        className={`font-bold tracking-tight text-sm transition-colors ${
          isActive ? "text-primary" : ""
        }`}
      >
        {item.title}
      </span>
      {item.badge && item.badge > 0 && (
        <span className="ml-auto flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-black text-primary">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
