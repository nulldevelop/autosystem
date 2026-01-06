"use client";

import {
  Bell,
  Box,
  Car,
  ChevronUp,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  Settings,
  User2,
  Users,
  Wrench,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LogoutButton } from "./logout-button";

// Módulos focados no AutoSystem
const allGestaoItems = [
  {
    title: "Orçamentos",
    url: "/dashboard/orcamentos",
    icon: ClipboardList,
    color: "text-orange-500",
  },
  {
    title: "Financeiro",
    url: "/dashboard/financeiro",
    icon: DollarSign,
    color: "text-green-500",
  },
  {
    title: "Estoque",
    url: "/dashboard/estoque",
    icon: Box,
  },
  {
    title: "Serviços/O.S",
    url: "/dashboard/servicos",
    icon: Wrench,
    badge: "Novo",
  },
  {
    title: "Clientes",
    url: "/dashboard/customer",
    icon: Users,
  },
  {
    title: "Veículos",
    url: "/dashboard/vehicle",
    icon: Car,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const menuGroups = [
    {
      title: "Geral",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Operacional",
      items: allGestaoItems, // Exibindo todos por padrão
    },
    {
      title: "Configurações",
      items: [
        { title: "Notificações", url: "/dashboard/notificacoes", icon: Bell },
        { title: "Oficina/Ajustes", url: "/dashboard/config", icon: Settings },
      ],
    },
  ];

  return (
    <Sidebar className="bg-black border-r border-white/10" {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Wrench className="size-6" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-black tracking-tighter italic text-white text-lg">
              AUTO<span className="text-green-500">SYSTEM</span>
            </span>
            <span className="truncate text-gray-500 text-[10px] uppercase tracking-wider font-bold">
              Oficina Mecânica
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-zinc-600 text-[10px] uppercase tracking-[0.15em] px-4 py-2 font-black">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="transition-all duration-200 group py-5"
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon
                          className={`size-5 transition-colors ${
                            item.color ||
                            "text-zinc-500 hover:text-green-500 group-data-active:text-green-500"
                          }`}
                        />
                        <span className="font-semibold tracking-tight ">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="ml-auto bg-orange-500 text-[10px] text-black font-black px-1.5 py-0.5 rounded italic">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="py-5 border-t border-white/5 bg-zinc-950/30 ">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="py-6">
                  <div className="flex items-center gap-3 px-2 py-6 mb-2">
                    <div className="size-8 rounded-full bg-linear-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                      AS
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-none">
                        Admin Oficina
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium mt-1">
                        Plano Pro
                      </span>
                    </div>
                  </div>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <LogoutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
