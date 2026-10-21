"use client";

import {
  BarChart3,
  Bell,
  Car,
  CreditCard,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Send,
  Settings,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CreateBudgetModal } from "./create-budget-modal";
import { CreateCustomerModal } from "./create-customer-modal";
import { CreateProductModal } from "./create-product-modal";
import { CreateVehicleModal } from "./create-vehicle-modal";

const TABS = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/dashboard/budget", label: "Orçamentos", icon: Send },
  { href: "/dashboard/service", label: "Serviços", icon: Wrench },
];

const MENU_ITEMS = [
  { href: "/dashboard/customer", label: "Clientes", icon: Users },
  { href: "/dashboard/vehicle", label: "Veículos", icon: Car },
  { href: "/dashboard/product", label: "Estoque", icon: Package },
  { href: "/dashboard/financeiro", label: "Financeiro", icon: TrendingUp },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notificações", icon: Bell },
  { href: "/dashboard/plans", label: "Planos", icon: CreditCard },
  { href: "/dashboard/config", label: "Configurações", icon: Settings },
];

const NEW_OPTIONS = [
  { id: "budget", icon: Send, label: "Novo orçamento" },
  { id: "customer", icon: Users, label: "Novo cliente" },
  { id: "vehicle", icon: Car, label: "Novo veículo" },
  { id: "product", icon: Package, label: "Novo produto" },
] as const;

type ModalType = (typeof NEW_OPTIONS)[number]["id"] | null;

export function MobileDock() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const openModal = (modal: ModalType) => {
    setNewOpen(false);
    setActiveModal(modal);
  };

  const tabClass = (active: boolean) =>
    cn(
      "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
      active ? "text-primary" : "text-muted-foreground active:text-foreground",
    );

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch px-2">
          {TABS.slice(0, 2).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={tabClass(isActive(href))}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          ))}

          <div className="flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              aria-label="Criar novo"
              className="-mt-5 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95"
            >
              <Plus className="size-6" aria-hidden />
            </button>
          </div>

          {TABS.slice(2).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={tabClass(isActive(href))}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={tabClass(menuOpen)}
          >
            <Menu className="size-5" aria-hidden />
            Mais
          </button>
        </div>
      </nav>

      <Sheet open={newOpen} onOpenChange={setNewOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-6">
          <SheetHeader>
            <SheetTitle>Criar novo</SheetTitle>
            <SheetDescription>O que você quer cadastrar?</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 px-4">
            {NEW_OPTIONS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => openModal(id)}
                className="flex min-h-20 flex-col items-start justify-between gap-3 rounded-xl border bg-surface p-3 text-left transition-colors active:bg-muted"
              >
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-6">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Todas as áreas do sistema</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 px-4">
            {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-lg border bg-surface px-3 text-sm font-medium transition-colors active:bg-muted",
                  isActive(href) && "border-primary/40 text-primary",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <CreateBudgetModal
        open={activeModal === "budget"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreateCustomerModal
        open={activeModal === "customer"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreateVehicleModal
        open={activeModal === "vehicle"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
      <CreateProductModal
        open={activeModal === "product"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      />
    </>
  );
}
