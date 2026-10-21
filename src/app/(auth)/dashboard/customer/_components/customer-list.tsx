"use client";

import {
  Mail,
  MapPin,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { SearchInput } from "@/components/app/toolbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Customer } from "@/generated/prisma/client";
import { deleteCustomer } from "../_actions/delete-customer";
import { CreateCustomerForm } from "./create-customer-form";
import { CustomerStats } from "./customer-stats";
import { EditCustomerForm } from "./edit-customer-form";

interface CustomerListProps {
  customers: Customer[];
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function CustomerList({ customers }: CustomerListProps) {
  const [isCreateCustomerModalOpen, setCreateCustomerModalOpen] =
    useState(false);
  const [isEditCustomerModalOpen, setEditCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.document.toLowerCase().includes(search) ||
        customer.phone?.includes(search),
    );
  }, [customers, searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCustomer(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (_error) {
      toast.error("Não foi possível remover o cliente.");
    } finally {
      setCustomerToDelete(null);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditCustomerModalOpen(true);
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
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Contatos e documentos de quem leva o carro para a oficina."
        actions={
          <Button onClick={() => setCreateCustomerModalOpen(true)}>
            <Plus /> Novo cliente
          </Button>
        }
      />

      <CustomerStats customers={customers} />

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por nome, e-mail, documento ou telefone"
      />

      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description={
            searchTerm
              ? "Tente buscar com outro nome, documento ou telefone."
              : "Cadastre o primeiro cliente para vincular veículos e orçamentos."
          }
          action={
            !searchTerm ? (
              <Button onClick={() => setCreateCustomerModalOpen(true)}>
                <Plus /> Novo cliente
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <li
              key={customer.id}
              className="flex flex-col rounded-xl border bg-card transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-3 p-4">
                <div
                  aria-hidden
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/12 font-display text-sm font-semibold text-primary"
                >
                  {initialsOf(customer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{customer.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="neutral">{customer.documentType}</Badge>
                    <span className="num truncate font-mono text-xs text-muted-foreground">
                      {customer.document}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Ações para ${customer.name}`}
                      className="-mt-1 -mr-2 text-muted-foreground"
                    >
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 py-2.5"
                      onClick={() => handleEdit(customer)}
                    >
                      <Pencil className="size-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 py-2.5 text-destructive focus:text-destructive"
                      onClick={() => setCustomerToDelete(customer)}
                    >
                      <Trash2 className="size-4" /> Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <dl className="space-y-1.5 px-4 pb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0" aria-hidden />
                  <dd className="truncate">{customer.email}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" aria-hidden />
                  <dd className="num">{customer.phone || "Sem telefone"}</dd>
                </div>
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0" aria-hidden />
                    <dd className="truncate">{customer.address}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-auto flex gap-2 border-t bg-surface p-3 rounded-b-xl">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={!customer.phone}
                  onClick={() => openWhatsApp(customer.phone, customer.name)}
                >
                  <Send className="text-success" /> WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(customer)}
                >
                  <Pencil /> Editar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              {customerToDelete?.name} será removido de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                customerToDelete && handleDelete(customerToDelete.id)
              }
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateCustomerForm
        open={isCreateCustomerModalOpen}
        onOpenChange={setCreateCustomerModalOpen}
      />

      <EditCustomerForm
        customer={editingCustomer}
        open={isEditCustomerModalOpen}
        onOpenChange={setEditCustomerModalOpen}
      />
    </div>
  );
}
