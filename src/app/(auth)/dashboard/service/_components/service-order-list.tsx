"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  Send, 
  FileText, 
  Link2, 
  Check, 
  Car, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  User,
  MoreVertical,
  Loader2,
  Wrench,
  XCircle,
  ArrowRight,
  Download
} from "lucide-react";
import type { ServiceOrder, ServiceOrderStatus } from "@/generated/prisma/client";
import type { BudgetWithRelations } from "@/types/budget";
import { PDFServiceOrderDownloadButtonOnly } from "./PDFServiceOrderDownloadButtonOnly";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { updateServiceOrderStatus } from "../_actions/update-service-order-status";

const STATUS_CONFIG: Record<ServiceOrderStatus, { label: string; color: string; icon: any }> = {
  open: { 
    label: "Aberta", 
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: Clock 
  },
  in_progress: { 
    label: "Em Andamento", 
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Wrench 
  },
  completed: { 
    label: "Concluída", 
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: CheckCircle2 
  },
  canceled: { 
    label: "Cancelada", 
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle 
  },
};

interface ServiceOrderWithBudget extends ServiceOrder {
  customer: { name: string; phone?: string | null };
  vehicle: { model: string; licensePlate?: string; marca?: string };
  budget: BudgetWithRelations;
}

interface ServiceOrderListProps {
  serviceOrders: ServiceOrderWithBudget[];
}

export function ServiceOrderList({ serviceOrders }: ServiceOrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredOS = useMemo(() => {
    return serviceOrders.filter((os) => {
      const matchesSearch = 
        os.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || os.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [serviceOrders, searchTerm, statusFilter]);

  const copyOSLink = (id: string) => {
    const link = `${window.location.origin}/service/sign/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link de assinatura da O.S. copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendOSWhatsApp = async (os: ServiceOrderWithBudget) => {
    const budget = os.budget;
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    
    const itemsStr = budget.items
      .map(i => `${i.product.name} (${i.quantity}x) - ${formatCurrency(i.quantity * i.unitPrice)}`)
      .join("\n");

    const message = `*ORDEM DE SERVIÇO - ${budget.organization?.name || 'AutoSystem'}*
O.S. #${os.id.substring(0, 8)}

*PROPRIETÁRIO*
Nome: ${os.customer.name}
Contato: ${os.customer.phone || 'N/A'}

*VEÍCULO*
Modelo: ${os.vehicle.marca} ${os.vehicle.model}
Placa: ${os.vehicle.licensePlate || 'N/A'}
Ano: ${os.vehicle.year}

*SERVIÇOS EM EXECUÇÃO*
${itemsStr}

*VALOR TOTAL: ${formatCurrency(os.totalAmount)}*

---
*ACESSE PARA AUTORIZAR:*
${window.location.origin}/service/sign/${os.id}`;

    const url = `https://api.whatsapp.com/send?phone=${os.customer.phone?.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success("WhatsApp aberto com a O.S. completa!");
  };

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100svh-100px)] overflow-hidden">
      {/* Header e Filtros */}
      <div className="flex flex-col gap-6 shrink-0 px-1">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Controle de <span className="text-primary">Ordens de Serviço</span>
          </h1>
          <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mt-0.5">
            Gerenciamento de execução e entregas
          </p>
        </div>

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
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button 
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-4 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                statusFilter === "all" ? "bg-primary text-black border-primary" : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
              )}
            >
              Todas
            </button>
            {(["open", "in_progress", "completed", "canceled"] as ServiceOrderStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-4 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
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

      {/* Área da Lista */}
      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-3 pb-10">
          {filteredOS.length > 0 ? (
            filteredOS.map((os) => {
              const status = STATUS_CONFIG[os.status];
              const StatusIcon = status.icon;

              return (
                <Card 
                  key={os.id} 
                  className="group border-white/5 bg-zinc-950/40 hover:bg-white/[0.02] transition-all duration-300"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row lg:items-center">
                      
                      {/* 1. Info Principal */}
                      <div className="flex-1 p-5 border-b lg:border-b-0 lg:border-r border-white/5">
                        <div className="flex items-start gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
                                O.S. #{os.id.substring(0, 8)}
                              </span>
                              <Badge className={cn("px-2 py-0 h-4 text-[8px] font-black uppercase tracking-[0.1em] border-0", status.color)}>
                                <StatusIcon className="size-2.5 mr-1" /> {status.label}
                              </Badge>
                            </div>
                            <Link href={`/dashboard/service/${os.id}`} className="group/link flex flex-col">
                              <h3 className="text-xl font-black text-white uppercase tracking-tighter group-hover/link:text-primary transition-colors">
                                {os.customer.name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-3 text-white/40">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                                <Car className="size-3 text-white/20" />
                                {os.vehicle.marca} {os.vehicle.model}
                              </div>
                              <span className="text-white/10">•</span>
                              <span className="text-[10px] font-black text-white/60 bg-white/5 px-1.5 py-0.5 rounded">
                                {os.vehicle.licensePlate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Dados de Data e Valor */}
                      <div className="px-5 py-4 lg:py-0 lg:w-48 border-b lg:border-b-0 lg:border-r border-white/5 flex lg:flex-col justify-between lg:justify-center gap-1">
                        <div>
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Abertura</p>
                          <p className="text-xs font-bold text-white/70">
                            {format(new Date(os.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right lg:text-left">
                          <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest">Total</p>
                          <p className="text-lg font-black italic tracking-tighter text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(os.totalAmount)}
                          </p>
                        </div>
                      </div>

                      {/* 3. Ações Exclusivas O.S. */}
                      <div className="p-4 lg:p-5 lg:w-auto lg:flex-none bg-white/[0.01] flex items-center justify-end">
                        <div className="flex flex-wrap lg:flex-nowrap items-center justify-end gap-2 w-full">
                          
                          <div className="w-full sm:w-auto min-w-[140px]">
                            <PDFServiceOrderDownloadButtonOnly budget={os.budget} />
                          </div>

                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-9 flex-1 sm:flex-none sm:px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-primary/50 transition-all gap-2"
                              onClick={() => copyOSLink(os.id)}
                            >
                              {copiedId === os.id ? <Check className="size-3.5 text-emerald-500" /> : <Link2 className="size-3.5" />}
                              <span className="sm:inline">Link</span>
                            </Button>

                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-9 flex-1 sm:flex-none sm:px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-emerald-500/50 transition-all gap-2"
                              onClick={() => handleSendOSWhatsApp(os)}
                            >
                              <Send className="size-3.5" />
                              <span className="sm:inline">Zap</span>
                            </Button>

                            <Link href={`/dashboard/service/${os.id}`} className="shrink-0">
                              <Button 
                                variant="tech" 
                                className="size-9 p-0 flex-shrink-0 glow-primary-hover rounded-md"
                                title="Gerenciar O.S."
                              >
                                <ArrowRight className="size-4 text-primary" />
                              </Button>
                            </Link>
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
              <h3 className="text-lg font-black uppercase text-white/40 italic">Nenhuma ordem de serviço encontrada</h3>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
