"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Check,
  FileText,
  Link2,
  Loader2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Plate } from "@/components/app/plate";
import { BudgetStatusBadge } from "@/components/app/status-badge";
import { Segmented, SearchInput } from "@/components/app/toolbar";
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
import type { Status } from "@/generated/prisma/client";
import type { BudgetWithRelations } from "@/types/budget";
import { deleteBudget } from "../_actions/delete-budget";
import { BudgetStats } from "./budget-stats";
import { CreateBudgetForm } from "./create-budget-form";
import { PDFDownloadButton } from "./PDFDownloadButton";

interface BudgetListProps {
  budgets: BudgetWithRelations[];
}

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function BudgetList({ budgets }: BudgetListProps) {
  const [isCreateBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  const filteredBudgets = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return budgets.filter((budget) => {
      const matchesSearch =
        budget.customer.name.toLowerCase().includes(term) ||
        budget.vehicle.model.toLowerCase().includes(term) ||
        budget.vehicle.licensePlate.toLowerCase().includes(term) ||
        budget.id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || budget.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [budgets, searchTerm, statusFilter]);

  const copyBudgetLink = (id: string) => {
    const link = `${window.location.origin}/budget/sign/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link do orçamento copiado");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendBudgetWhatsApp = async (budget: BudgetWithRelations) => {
    setSendingId(budget.id);

    const totalGeral = budget.totalAmount;

    const itemsList = budget.items
      .map(
        (i) =>
          `• ${i.product.name}: ${i.quantity}x R$ ${i.unitPrice.toFixed(2)}`,
      )
      .join("\n");

    const message = `Olá ${budget.customer.name}!\n\nSegue o seu Orçamento da oficina:\n\n*Veículo:* ${budget.vehicle.marca} ${budget.vehicle.model} (${budget.vehicle.licensePlate})\n\n*Itens:*\n${itemsList}\n\n*Total:* R$ ${totalGeral.toFixed(2)}\n\nPara visualizar e assinar online, clique no link:\n${window.location.origin}/budget/sign/${budget.id}`;

    const url = `https://api.whatsapp.com/send?phone=${budget.customer.phone?.replace(/\D/g, "")}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setSendingId(null);
    toast.success("WhatsApp aberto com o orçamento");
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteBudget(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (_error) {
      toast.error("Não foi possível excluir o orçamento.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Crie, envie e acompanhe a aprovação dos orçamentos."
        actions={
          <Button onClick={() => setCreateBudgetModalOpen(true)}>
            <Plus /> Novo orçamento
          </Button>
        }
      />

      <BudgetStats budgets={budgets} />

      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por cliente, placa ou veículo"
        />
        <Segmented
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Todos", count: budgets.length },
            { value: "pending", label: "Pendentes" },
            { value: "aproved", label: "Aprovados" },
            { value: "rejected", label: "Rejeitados" },
          ]}
        />
      </div>

      {filteredBudgets.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento encontrado"
          description={
            searchTerm || statusFilter !== "all"
              ? "Nada bate com a busca ou o filtro atual. Tente limpar os filtros."
              : "Crie o primeiro orçamento para enviar ao cliente."
          }
          action={
            !searchTerm && statusFilter === "all" ? (
              <Button onClick={() => setCreateBudgetModalOpen(true)}>
                <Plus /> Novo orçamento
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-3">
          {filteredBudgets.map((budget) => {
            const isDeletingCurrent = isDeleting === budget.id;
            return (
              <li
                key={budget.id}
                className="overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/30"
              >
                <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                  <Link
                    href={`/dashboard/budget/${budget.id}`}
                    className="group min-w-0 flex-1 space-y-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <BudgetStatusBadge status={budget.status} />
                      <span className="num font-mono text-xs text-muted-foreground">
                        #{budget.id.substring(0, 8)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(budget.createdAt), "dd MMM yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
                      {budget.customer.name}
                    </h3>
                    <div className="flex min-w-0 items-center gap-2">
                      <Plate value={budget.vehicle.licensePlate} />
                      <span className="truncate text-sm text-muted-foreground">
                        {budget.vehicle.marca} {budget.vehicle.model}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end lg:justify-center">
                    <span className="text-sm text-muted-foreground lg:hidden">
                      Total
                    </span>
                    <p className="num font-display text-xl font-semibold">
                      {brl(budget.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t bg-surface px-4 py-3 sm:px-5">
                  <PDFDownloadButton budget={budget} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyBudgetLink(budget.id)}
                  >
                    {copiedId === budget.id ? (
                      <Check className="text-success" />
                    ) : (
                      <Link2 />
                    )}
                    {copiedId === budget.id ? "Copiado" : "Link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sendingId === budget.id}
                    onClick={() => handleSendBudgetWhatsApp(budget)}
                  >
                    <Send className="text-success" />
                    WhatsApp
                  </Button>

                  {budget.status === "pending" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={isDeletingCurrent}
                          aria-label="Excluir orçamento"
                          className="ml-auto text-muted-foreground hover:text-destructive"
                        >
                          {isDeletingCurrent ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Excluir orçamento?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            O orçamento de {budget.customer.name} será removido
                            de forma permanente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(budget.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CreateBudgetForm
        open={isCreateBudgetModalOpen}
        onOpenChange={setCreateBudgetModalOpen}
      />
    </div>
  );
}
