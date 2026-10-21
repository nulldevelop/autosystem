"use client";

import { ChevronDown, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/app/(auth)/dashboard/_components/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HeaderUserMenu({
  session,
  hasOrg,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Session from better-auth
  session: any;
  hasOrg?: boolean;
}) {
  const router = useRouter();

  if (!session) return null;

  const name: string = session.user.name ?? "Minha conta";
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex min-h-10 items-center gap-2 rounded-full border bg-card py-1 pr-2 pl-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60 sm:pr-3"
        aria-label="Menu da conta"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {initials}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium md:block">
          {name}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!hasOrg && (
          <DropdownMenuItem
            onClick={() => router.push("/dashboard?createOrg=true")}
            className="cursor-pointer gap-2 py-2.5"
          >
            <Plus className="size-4" /> Criar oficina
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2.5">
          <Link href="/dashboard/config">
            <Settings className="size-4" /> Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer gap-2 py-2.5 focus:bg-destructive/10 focus:text-destructive">
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
