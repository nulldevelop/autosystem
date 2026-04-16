"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/app/(auth)/dashboard/_components/logout-button";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

export function HeaderUserMenu({ session }: { session: any }) {
  if (!session) return null;

  const initials = session.user.name?.substring(0, 2).toUpperCase() || "AD";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-green-800 flex items-center justify-center text-[10px] font-black text-black">
            {initials}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              {session.user.name}
            </span>
          </div>
          <ChevronDown size={14} className="text-white/20" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-[#111] border-white/10 text-white rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase text-white/40 tracking-widest">
          Minha Conta
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem className="rounded-xl focus:bg-white/5 cursor-pointer p-3 text-sm gap-2 font-medium">
          <User size={16} className="text-primary" /> Perfil
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl focus:bg-white/5 cursor-pointer p-3 text-sm gap-2 font-medium">
          <Settings size={16} className="text-primary" /> Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem className="rounded-xl focus:bg-red-500/10 focus:text-red-500 cursor-pointer p-3 text-sm gap-2 font-bold transition-colors">
          <LogOut size={16} />
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
