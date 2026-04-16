"use client";

import {
  Loader2,
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Customer } from "@/generated/prisma/client";
import { deleteCustomer } from "../_actions/delete-customer";
import { CreateCustomerForm } from "./create-customer-form";
import { CustomerStats } from "./customer-stats";

interface CustomerListProps {
  customers: Customer[];
}

export function CustomerList({ customers }: CustomerListProps) {
  const [isCreateCustomerModalOpen, setCreateCustomerModalOpen] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const search = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.document.toLowerCase().includes(search) ||
        customer.phone?.includes(search)
      );
    });
  }, [customers, searchTerm]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteCustomer(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (_error) {
      toast.error("Erro ao tentar remover cliente.");
    } finally {
      setIsDeleting(null);
    }
  };

  const openWhatsApp = (phone: string | null, name: string) => {
    if (!phone) return;
    const text = `Olá ${name}!`;
    window.open(
      `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  return (
    <div className="flex flex-col gap-5 lg:gap-6 lg:h-[calc(100svh-100px)] lg:overflow-hidden">
      <div className="flex flex-col gap-5 lg:gap-6 shrink-0 px-3 lg:px-1">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white">
              Base de <span className="text-primary">Clientes</span>
            </h1>
            <p className="text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Gestão de relacionamento e histórico técnico
            </p>
          </div>
          <Button
            onClick={() => setCreateCustomerModalOpen(true)}
            className="glow-primary h-11 sm:h-12 px-4 sm:px-8 font-black uppercase italic tracking-tighter text-sm sm:text-md w-full sm:w-auto"
          >
            <Plus className="size-4 sm:size-5 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <CustomerStats customers={customers} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
          <Input
            placeholder="Buscar cliente..."
            className="pl-10 bg-white/[0.02] border-white/10 text-sm focus:border-primary/50 h-11 lg:h-12 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-20 overflow-y-auto lg:pb-10 lg:pr-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const isDeletingCurrent = isDeleting === customer.id;

            return (
              <Card
                key={customer.id}
                className="group border-white/5 bg-zinc-950/40 hover:bg-white/[0.02] transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4 lg:hidden">
                    <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <User className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">
                          {customer.documentType}
                        </span>
                        <span className="text-[9px] font-bold text-white/40">
                          {customer.document}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
                        {customer.name}
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0 text-white/40 hover:text-white hover:bg-white/10"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-zinc-950 border-white/10"
                      >
                        <DropdownMenuItem
                          className="text-emerald-500 focus:text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                          onClick={() =>
                            openWhatsApp(customer.phone, customer.name)
                          }
                          disabled={!customer.phone}
                        >
                          <Send className="size-4 mr-2" />
                          WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                          <Pencil className="size-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                              <Trash2 className="size-4 mr-2" />
                              {isDeletingCurrent ? "Removendo..." : "Remover"}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-black uppercase italic tracking-tighter text-xl">
                                Remover Cliente?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-white/60">
                                Esta ação removerá o cliente permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(customer.id)}
                                className="bg-red-600 text-white hover:bg-red-700 font-bold"
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="hidden lg:flex lg:flex-col xl:flex-row xl:items-center">
                    <div className="flex-1 p-5 border-b xl:border-b-0 xl:border-r border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                          <User className="size-6" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">
                              {customer.documentType}
                            </span>
                            <span className="text-[10px] font-bold text-white/40 tracking-wider">
                              {customer.document}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                            {customer.name}
                          </h3>
                          <div className="flex items-center gap-3 text-white/40">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium">
                              <Mail className="size-3 text-white/20" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4 xl:py-0 xl:w-[300px] border-b xl:border-b-0 xl:border-r border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-white/5 flex items-center justify-center">
                          <Phone className="size-3.5 text-white/40" />
                        </div>
                        <span className="text-sm font-bold text-white/80">
                          {customer.phone || "Sem telefone"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-white/5 flex items-center justify-center">
                          <MapPin className="size-3.5 text-white/40" />
                        </div>
                        <span className="text-[10px] font-medium text-white/40 line-clamp-1">
                          {customer.address || "Endereço não cadastrado"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 xl:p-5 xl:w-[380px] bg-white/[0.01] flex items-center justify-end gap-2">
                      <div className="flex items-center gap-2 w-full justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-primary/50 transition-all gap-2"
                          onClick={() =>
                            openWhatsApp(customer.phone, customer.name)
                          }
                          disabled={!customer.phone}
                        >
                          <Send className="size-3.5 text-emerald-500" />
                          WhatsApp
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-white/20 transition-all gap-2"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isDeletingCurrent}
                              className="h-9 px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all gap-2"
                            >
                              {isDeletingCurrent ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                              Remover
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-black uppercase italic tracking-tighter text-2xl">
                                Remover Cliente?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-white/60">
                                Esta ação removerá o cliente permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(customer.id)}
                                className="bg-red-600 text-white hover:bg-red-700 font-bold"
                              >
                                Confirmar Remoção
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>

                  <div className="lg:hidden px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-white/50">
                      <Mail className="size-3.5 shrink-0" />
                      <span className="text-xs truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                      <Phone className="size-3.5 shrink-0" />
                      <span className="text-xs">
                        {customer.phone || "Sem telefone"}
                      </span>
                    </div>
                    {customer.address && (
                      <div className="flex items-center gap-2 text-white/50">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="text-xs truncate">
                          {customer.address}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="py-16 lg:py-24 text-center border-2 border-dashed border-white/5 rounded-2xl lg:rounded-[2rem] bg-white/[0.01]">
            <User className="size-10 lg:size-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-black uppercase text-white/40 italic">
              Nenhum cliente encontrado
            </h3>
          </div>
        )}
      </div>

      <CreateCustomerForm
        open={isCreateCustomerModalOpen}
        onOpenChange={setCreateCustomerModalOpen}
      />
    </div>
  );
}
