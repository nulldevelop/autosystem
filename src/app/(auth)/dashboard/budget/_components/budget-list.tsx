"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { 
  Send, 
  FileText, 
  Link2, 
  Check, 
  Car, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
  ArrowUpRight,
  Search,
  Plus,
  Calendar,
  User,
  MoreVertical,
  Loader2,
  Trash2,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Download
} from "lucide-react";
import type { Status } from "@/generated/prisma/client";
import type { BudgetWithRelations } from "@/types/budget";
import { CreateBudgetForm } from "./create-budget-form";
import { PDFDownloadButton } from "./PDFDownloadButton";
import { PDFServiceOrderDownloadButton } from "./PDFServiceOrderDownloadButton";
import { BudgetStats } from "./budget-stats";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { deleteBudget } from "../_actions/delete-budget";

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: any }> = {
  pending: { 
    label: "Pendente", 
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: Clock 
  },
  aproved: { 
    label: "Aprovado", 
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: CheckCircle2 
  },
  rejected: { 
    label: "Rejeitado", 
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: AlertCircle 
  },
};

interface BudgetListProps {
  budgets: BudgetWithRelations[];
}

export function BudgetList({ budgets }: BudgetListProps) {
  const [isCreateBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedOSId, setCopiedOSId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingOSId, setSendingOSId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [isPending, startTransition] = useTransition();

  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      const matchesSearch = 
        budget.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || budget.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [budgets, searchTerm, statusFilter]);

  const copyBudgetLink = (id: string) => {
    const link = `${window.location.origin}/budget/sign/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link do Orçamento copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyOSLink = (id: string) => {
    const link = `${window.location.origin}/dashboard/service/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedOSId(id);
    toast.success("Link da Ordem de Serviço copiado!");
    setTimeout(() => setCopiedOSId(null), 2000);
  };

  const handleSendBudgetWhatsApp = async (budget: BudgetWithRelations) => {
    setSendingId(budget.id);
    
    const subtotal = budget.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const marginValue = budget.totalAmount - subtotal;
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const checklistStr = budget.checklist 
      ? Object.entries(budget.checklist as Record<string, boolean>)
          .filter(([_, v]) => v)
          .map(([k, _]) => k.replace("_", " ").toUpperCase())
          .join(" | ")
      : "";

    const itemsStr = budget.items
      .map(i => `${i.product.name} (${i.quantity}x) - ${formatCurrency(i.quantity * i.unitPrice)}`)
      .join("\n");

    const message = `*ORÇAMENTO TÉCNICO - ${budget.organization?.name || 'AutoSystem'}*

*PROPRIETÁRIO*
Nome: ${budget.customer.name}
Contato: ${budget.customer.phone || 'N/A'}

*VEÍCULO*
Modelo: ${budget.vehicle.marca} ${budget.vehicle.model}
Placa: ${budget.vehicle.licensePlate}
Ano: ${budget.vehicle.year}

*ANAMNESE DE ENTRADA*
KM: ${budget.kilometers || 0} | Combustível: ${budget.fuelLevel}%
${checklistStr}

*SERVIÇOS E PEÇAS*
${itemsStr}

*RESUMO FINANCEIRO*
Subtotal Itens: ${formatCurrency(subtotal)}
Mão de Obra/Margem: ${formatCurrency(marginValue)}
*TOTAL DO ORÇAMENTO: ${formatCurrency(budget.totalAmount)}*

---
*ACESSE PARA ASSINAR:*
${window.location.origin}/budget/sign/${budget.id}`;

    const url = `https://api.whatsapp.com/send?phone=${budget.customer.phone?.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setSendingId(null);
    toast.success("WhatsApp aberto com o Orçamento completo!");
  };

  const handleSendOSWhatsApp = async (budget: BudgetWithRelations) => {
    if (!budget.serviceOrder) return;
    setSendingOSId(budget.id);
    const message = `Olá ${budget.customer.name}, sua Ordem de Serviço #${budget.serviceOrder.id.substring(0, 8)} está disponível. Acesse: ${window.location.origin}/dashboard/service/${budget.serviceOrder.id}`;
    const url = `https://api.whatsapp.com/send?phone=${budget.customer.phone?.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setSendingOSId(null);
    toast.success("WhatsApp aberto com a O.S.!");
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
    } catch (error) {
      toast.error("Erro ao tentar excluir orçamento.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100svh-100px)] overflow-hidden">
      {/* Header e Filtros - Fixos */}
      <div className="flex flex-col gap-6 shrink-0 px-1">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Controle de <span className="text-primary">Orçamentos</span>
            </h1>
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">
              Fluxo operacional e aprovações
            </p>
          </div>
          <Button
            onClick={() => setCreateBudgetModalOpen(true)}
            className="glow-primary h-12 px-6 font-black uppercase italic tracking-tighter text-md"
          >
            <Plus className="size-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>

        <BudgetStats budgets={budgets} />

        <div className="flex flex-col lg:flex-row gap-3 bg-zinc-950/50 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
            <Input 
              placeholder="Buscar por cliente, placa ou veículo..." 
              className="pl-10 bg-white/[0.02] border-white/10 text-sm focus:border-primary/50 h-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                statusFilter === "all" ? "bg-primary text-black border-primary" : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
              )}
            >
              Todos
            </button>
            {(["pending", "aproved", "rejected"] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                  statusFilter === s 
                    ? "bg-white text-black border-white" 
                    : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
                )}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Área da Lista - Rolável */}
      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-3 pb-10">
          {filteredBudgets.length > 0 ? (
            filteredBudgets.map((budget) => {
              const status = STATUS_CONFIG[budget.status];
              const StatusIcon = status.icon;
              const isSending = sendingId === budget.id;
              const isDeletingCurrent = isDeleting === budget.id;

              return (
                <Card 
                  key={budget.id} 
                  className="group border-white/5 bg-zinc-950/40 hover:bg-white/[0.02] transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row lg:items-center">
                      
                      {/* 1. Info Principal (Cliente e Veículo) */}
                      <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-white/5">
                        <div className="flex items-start justify-between lg:justify-start lg:gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
                                #{budget.id.substring(0, 8)}
                              </span>
                              <Badge className={cn("px-2 py-0 h-4 text-[8px] font-black uppercase tracking-[0.1em] border-0", status.color)}>
                                <StatusIcon className="size-2.5 mr-1" /> {status.label}
                              </Badge>
                            </div>
                            <Link href={`/dashboard/budget/${budget.id}`} className="group/link flex flex-col">
                              <h3 className="text-xl font-black text-white uppercase tracking-tighter group-hover/link:text-primary transition-colors">
                                {budget.customer.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-3 text-white/40">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                                <Car className="size-3 text-white/20" />
                                {budget.vehicle.marca} {budget.vehicle.model}
                              </div>
                              <span className="text-white/10">•</span>
                              <span className="text-[10px] font-black text-white/60 bg-white/5 px-1.5 py-0.5 rounded">
                                {budget.vehicle.licensePlate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Dados de Data e Valor */}
                      <div className="px-5 py-4 lg:py-0 lg:w-48 border-b lg:border-b-0 lg:border-r border-white/5 flex lg:flex-col justify-between lg:justify-center gap-1">
                        <div>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Emissão</p>
                          <p className="text-xs font-bold text-white/70">
                            {format(new Date(budget.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right lg:text-left">
                          <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest">Total</p>
                          <p className="text-lg font-black italic tracking-tighter text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* 3. Ações Diretas (Control Center Compacto) */}
                      <div className="p-4 lg:p-5 lg:w-auto lg:flex-none bg-white/[0.01] flex items-center justify-end">
                        <div className="flex flex-wrap lg:flex-nowrap items-center justify-end gap-2 w-full">
                          
                          <div className="w-full sm:w-auto min-w-[120px]">
                            <PDFDownloadButton budget={budget} />
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-9 flex-1 sm:flex-none sm:px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-primary/50 transition-all gap-2"
                              onClick={() => copyBudgetLink(budget.id)}
                            >
                              {copiedId === budget.id ? <Check className="size-3.5 text-emerald-500" /> : <Link2 className="size-3.5" />}
                              <span className="sm:inline">Link</span>
                            </Button>

                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={sendingId === budget.id}
                              className="h-9 flex-1 sm:flex-none sm:px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-emerald-500/50 transition-all gap-2"
                              onClick={() => handleSendBudgetWhatsApp(budget)}
                            >
                              <Send className="size-3.5" />
                              <span className="sm:inline">Zap</span>
                            </Button>

                            {budget.status === 'pending' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={isDeletingCurrent}
                                    className="size-9 shrink-0 p-0 border-white/5 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                  >
                                    {isDeletingCurrent ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-black uppercase italic tracking-tighter text-2xl">Excluir Orçamento?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-white/60">
                                      Esta ação não pode ser desfeita. O orçamento será removido permanentemente do sistema.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(budget.id)}
                                      className="bg-red-600 text-white hover:bg-red-700 font-bold"
                                    >
                                      Confirmar Exclusão
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <FileText className="size-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-black uppercase text-white/40 italic">Nenhum orçamento encontrado</h3>
            </div>
          )}
        </div>
      </ScrollArea>

      <CreateBudgetForm
        open={isCreateBudgetModalOpen}
        onOpenChange={setCreateBudgetModalOpen}
      />
    </div>
  );
}
