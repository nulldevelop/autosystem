"use client";

import {
  BarChart3,
  Car,
  DollarSign,
  Home,
  Menu,
  Package,
  Plus,
  Send,
  Settings,
  Users,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CreateBudgetModal } from "./create-budget-modal";
import { CreateCustomerModal } from "./create-customer-modal";
import { CreateProductModal } from "./create-product-modal";
import { CreateVehicleModal } from "./create-vehicle-modal";

const DOCK_ITEMS = [
  {
    id: "home",
    icon: Home,
    label: "Início",
    href: "/dashboard",
    color: "text-white",
  },
  {
    id: "finance",
    icon: DollarSign,
    label: "Financeiro",
    href: "/dashboard/financeiro",
    color: "text-emerald-400",
  },
];

const MENU_ITEMS = [
  {
    id: "budget",
    icon: Send,
    label: "Orçamentos",
    href: "/dashboard/budget",
    color: "text-primary",
  },
  {
    id: "service",
    icon: Wrench,
    label: "Ordens de Serviço",
    href: "/dashboard/service",
    color: "text-emerald-500",
  },
  {
    id: "customer",
    icon: Users,
    label: "Clientes",
    href: "/dashboard/customer",
    color: "text-blue-500",
  },
  {
    id: "vehicle",
    icon: Car,
    label: "Veículos",
    href: "/dashboard/vehicle",
    color: "text-purple-500",
  },
  {
    id: "product",
    icon: Package,
    label: "Estoque",
    href: "/dashboard/product",
    color: "text-yellow-500",
  },
  {
    id: "reports",
    icon: BarChart3,
    label: "Relatórios",
    href: "/dashboard/relatorios",
    color: "text-orange-500",
  },
];

const NEW_OPTIONS = [
  {
    id: "budget",
    icon: Send,
    label: "Orçamento",
    modal: "budget" as const,
    color: "bg-primary/10 border-primary/20 text-primary",
  },
  {
    id: "customer",
    icon: Users,
    label: "Cliente",
    modal: "customer" as const,
    color: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  },
  {
    id: "vehicle",
    icon: Car,
    label: "Veículo",
    modal: "vehicle" as const,
    color: "bg-purple-500/10 border-purple-500/20 text-purple-500",
  },
  {
    id: "product",
    icon: Package,
    label: "Produto",
    modal: "product" as const,
    color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
  },
];

type ModalType = "budget" | "customer" | "vehicle" | "product" | null;

export function MobileDock() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (modal: ModalType) => {
    setActiveModal(modal);
    setIsNewOpen(false);
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        <div className="relative flex items-center justify-center px-4 pb-2">
          <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-white/10">
            {DOCK_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-white/5 transition-all duration-200 active:scale-90"
                >
                  <div className="p-1.5 rounded-lg">
                    <Icon className={cn("size-5", item.color)} />
                  </div>
                </Link>
              );
            })}

            <div className="w-px h-8 bg-white/10 mx-1" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNewOpen(!isNewOpen)}
                className={cn(
                  "flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300",
                  isNewOpen
                    ? "bg-white/10 border border-white/20 text-white rotate-180"
                    : "bg-primary text-black hover:bg-primary/90",
                )}
              >
                <Plus className="size-6" />
              </button>

              {isNewOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-zinc-950/95 backdrop-blur-xl border border-white/10 min-w-[140px]">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30 text-center px-1">
                      Novo Cadastro
                    </p>
                    {NEW_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => openModal(option.modal)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full text-left",
                            option.color,
                          )}
                        >
                          <Icon className="size-4" />
                          <span className="text-xs font-bold text-white/80">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-zinc-950/95 border-r border-b border-white/10" />
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-white/10 mx-1" />

            <Link
              href="/dashboard/config"
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl hover:bg-white/5 text-white/60 transition-all duration-200"
            >
              <Settings className="size-5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
                isMenuOpen
                  ? "bg-primary text-black"
                  : "hover:bg-white/5 text-white/60",
              )}
            >
              {isMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          <div className="fixed bottom-24 left-0 right-0 z-50 lg:hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="mx-auto max-w-sm px-4">
              <div className="p-4 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-white/10 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border border-white/5 bg-white/5 transition-all duration-200 hover:bg-white/10 active:scale-[0.98]",
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="p-2 rounded-lg bg-white/5">
                          <Icon className={cn("size-4", item.color)} />
                        </div>
                        <span className="text-xs font-bold text-white/80">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {isNewOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => setIsNewOpen(false)}
        />
      )}

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
