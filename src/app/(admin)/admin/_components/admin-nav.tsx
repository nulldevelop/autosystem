"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Visão geral", exact: true },
  { href: "/admin/oficinas", label: "Oficinas" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/assinaturas", label: "Assinaturas" },
  { href: "/admin/pagamentos", label: "Pagamentos" },
  { href: "/admin/auditoria", label: "Auditoria" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Seções do painel"
      className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-px sm:mx-0 sm:px-0"
    >
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
