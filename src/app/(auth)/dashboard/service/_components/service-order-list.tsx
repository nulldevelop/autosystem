"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Link2,
  Phone,
  Search,
  Send,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  ServiceOrder,
  ServiceOrderStatus,
} from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import type { BudgetWithRelations } from "@/types/budget";
import { PDFServiceOrderDownloadButtonOnly } from "./PDFServiceOrderDownloadButtonOnly";

const STATUS_CONFIG: Record<
  ServiceOrderStatus,
  { label: string; color: string; icon: any }
> = {
  open: {
    label: "Aberta",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: Clock,
  },
  in_progress: {
    label: "Em Andamento",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Wrench,
  },
  completed: {
    label: "Concluída",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: CheckCircle2,
  },
  canceled: {
    label: "Cancelada",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
};

interface ServiceOrderWithBudget extends ServiceOrder {
  customer: { name: string; phone?: string | null };
  vehicle: {
    model: string;
    licensePlate?: string;
    marca?: string;
    year?: number | null;
  };
  budget: BudgetWithRelations;
}

interface ServiceOrderListProps {
  serviceOrders: ServiceOrderWithBudget[];
}

function ServiceOrderCardMobile({
  os,
  onCopy,
  onWhatsApp,
  copiedId,
}: {
  os: ServiceOrderWithBudget;
  onCopy: () => void;
  onWhatsApp: () => void;
  copiedId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[os.status];
  const StatusIcon = status.icon;

  return (
    <Card className="border-white/5 bg-zinc-950/40">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "size-10 rounded-xl flex items-center justify-center shrink-0 border",
              os.status === "open"
                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                : os.status === "in_progress"
                  ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  : os.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20",
            )}
          >
            <StatusIcon className="size-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[7px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
                O.S. #{os.id.substring(0, 6)}
              </span>
              <Badge
                className={cn(
                  "px-1.5 py-0 h-4 text-[6px] font-black uppercase tracking-[0.05em] border-0",
                  status.color,
                )}
              >
                <StatusIcon className="size-2 mr-0.5" /> {status.label}
              </Badge>
            </div>

            <Link href={`/dashboard/service/${os.id}`}>
              <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight mt-1 truncate hover:text-primary transition-colors">
                {os.customer.name}
              </h3>
            </Link>

            <div className="flex items-center gap-2 text-white/40 mt-0.5">
              <Car className="size-2.5" />
              <span className="text-[9px] font-bold truncate">
                {os.vehicle.marca} {os.vehicle.model}
              </span>
              <span className="text-[8px] font-black text-white/60 bg-white/5 px-1 py-0.5 rounded shrink-0">
                {os.vehicle.licensePlate}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-white/30">
                <Calendar className="size-2.5" />
                <span className="text-[8px] font-bold uppercase">
                  {format(new Date(os.createdAt), "dd MMM", { locale: ptBR })}
                </span>
              </div>
              <p className="text-sm font-black italic text-primary">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(os.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-[8px] font-black uppercase border-white/5 bg-white/5"
            onClick={onCopy}
          >
            {copiedId === os.id ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Link2 className="size-3" />
            )}
            <span className="ml-1">Link</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-[8px] font-black uppercase border-white/5 bg-white/5"
            onClick={onWhatsApp}
          >
            <Send className="size-3" />
            <span className="ml-1">WhatsApp</span>
          </Button>

          <Link href={`/dashboard/service/${os.id}`} className="shrink-0">
            <Button
              variant="ghost"
              className="size-8 p-0 glow-primary-hover rounded-md"
            >
              <ArrowRight className="size-4 text-primary" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-2 py-1.5 text-[8px] font-black text-white/30 uppercase tracking-widest border-t border-white/5"
        >
          {expanded ? "OCULTAR" : "MAIS DETALHES"}
        </button>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-[9px]">
              <span className="text-white/30 font-bold uppercase flex items-center gap-1">
                <User className="size-3" /> Cliente:
              </span>
              <span className="text-white/70 font-black">
                {os.customer.name}
              </span>
            </div>
            {os.customer.phone && (
              <div className="flex justify-between text-[9px]">
                <span className="text-white/30 font-bold uppercase flex items-center gap-1">
                  <Phone className="size-3" /> Telefone:
                </span>
                <span className="text-white/70 font-black">
                  {os.customer.phone}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[9px]">
              <span className="text-white/30 font-bold uppercase flex items-center gap-1">
                <Car className="size-3" /> Veículo:
              </span>
              <span className="text-white/70 font-black">
                {os.vehicle.marca} {os.vehicle.model}
              </span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-white/30 font-bold uppercase flex items-center gap-1">
                <Calendar className="size-3" /> Abertura:
              </span>
              <span className="text-white/70 font-black">
                {format(new Date(os.createdAt), "dd MMMM yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="mt-3">
              <PDFServiceOrderDownloadButtonOnly budget={os.budget} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ServiceOrderList({ serviceOrders }: ServiceOrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | "all">(
    "all",
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const stats = useMemo(() => {
    return {
      total: serviceOrders.length,
      open: serviceOrders.filter((os) => os.status === "open").length,
      inProgress: serviceOrders.filter((os) => os.status === "in_progress")
        .length,
      completed: serviceOrders.filter((os) => os.status === "completed").length,
      canceled: serviceOrders.filter((os) => os.status === "canceled").length,
    };
  }, [serviceOrders]);

  const filteredOS = useMemo(() => {
    return serviceOrders.filter((os) => {
      const matchesSearch =
        os.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.vehicle.licensePlate
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        os.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || os.status === statusFilter;

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
    const formatCurrency = (val: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(val);

    const itemsStr = budget.items
      .map(
        (i) =>
          `${i.product.name} (${i.quantity}x) - ${formatCurrency(i.quantity * i.unitPrice)}`,
      )
      .join("\n");

    const message = `*ORDEM DE SERVIÇO - ${budget.organization?.name || "AutoSystem"}*
O.S. #${os.id.substring(0, 8)}

*PROPRIETÁRIO*
Nome: ${os.customer.name}
Contato: ${os.customer.phone || "N/A"}

*VEÍCULO*
Modelo: ${os.vehicle.marca} ${os.vehicle.model}
Placa: ${os.vehicle.licensePlate || "N/A"}
Ano: ${os.vehicle.year}

*SERVIÇOS EM EXECUÇÃO*
${itemsStr}

*VALOR TOTAL: ${formatCurrency(os.totalAmount)}*

---
*ACESSE PARA AUTORIZAR:*
${window.location.origin}/service/sign/${os.id}`;

    const url = `https://api.whatsapp.com/send?phone=${os.customer.phone?.replace(/\D/g, "")}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("WhatsApp aberto com a O.S. completa!");
  };

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100svh-100px)] overflow-hidden">
      <div className="flex flex-col gap-4 shrink-0 px-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white">
              Ordens de <span className="text-primary">Serviço</span>
            </h1>
            <p className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-0.5">
              Gerenciamento de execução
            </p>
          </div>

          <div className="hidden sm:flex gap-2">
            <div className="flex items-center gap-3 bg-zinc-950/50 px-3 py-2 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3 text-yellow-500" />
                <span className="text-[9px] font-black text-white/50 uppercase">
                  {stats.open}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <Wrench className="size-3 text-blue-500" />
                <span className="text-[9px] font-black text-white/50 uppercase">
                  {stats.inProgress}
                </span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span className="text-[9px] font-black text-white/50 uppercase">
                  {stats.completed}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:hidden">
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-2 text-center">
              <Clock className="size-3 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg font-black text-white">{stats.open}</p>
              <p className="text-[6px] font-black text-white/40 uppercase">
                Abertas
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-2 text-center">
              <Wrench className="size-3 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-black text-white">
                {stats.inProgress}
              </p>
              <p className="text-[6px] font-black text-white/40 uppercase">
                Em Prog.
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-2 text-center">
              <CheckCircle2 className="size-3 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-black text-white">{stats.completed}</p>
              <p className="text-[6px] font-black text-white/40 uppercase">
                Concl.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-zinc-950/50 p-2.5 sm:p-3 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 size-3.5 sm:size-4 text-white/20" />
            <Input
              placeholder="Buscar..."
              className="pl-8 sm:pl-10 bg-white/[0.02] border-white/10 text-xs sm:text-sm focus:border-primary/50 h-9 sm:h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden sm:flex gap-1.5">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                statusFilter === "all"
                  ? "bg-primary text-black border-primary"
                  : "bg-white/5 text-white/40 border-white/5 hover:border-white/10",
              )}
            >
              Todas
            </button>
            {(
              [
                "open",
                "in_progress",
                "completed",
                "canceled",
              ] as ServiceOrderStatus[]
            ).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                  statusFilter === s
                    ? "bg-white text-black border-white"
                    : "bg-white/5 text-white/40 border-white/5 hover:border-white/10",
                )}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="sm:hidden flex items-center justify-center gap-2 h-9 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest"
          >
            <Clock className="size-3" /> Filtros
          </button>
        </div>
      </div>

      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-zinc-950 border-white/5 max-h-[70vh]"
        >
          <SheetHeader>
            <SheetTitle className="text-white font-black uppercase tracking-wider text-sm">
              Filtrar por Status
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setIsFilterSheetOpen(false);
              }}
              className={cn(
                "w-full px-4 h-12 rounded-lg text-xs font-black uppercase tracking-widest transition-all border text-left flex items-center gap-3",
                statusFilter === "all"
                  ? "bg-primary text-black border-primary"
                  : "bg-white/5 text-white/40 border-white/5",
              )}
            >
              <span className="flex-1">Todas ({stats.total})</span>
              {statusFilter === "all" && <Check className="size-4" />}
            </button>
            {(
              [
                "open",
                "in_progress",
                "completed",
                "canceled",
              ] as ServiceOrderStatus[]
            ).map((s) => {
              const status = STATUS_CONFIG[s];
              const StatusIcon = status.icon;
              const count =
                s === "open"
                  ? stats.open
                  : s === "in_progress"
                    ? stats.inProgress
                    : s === "completed"
                      ? stats.completed
                      : stats.canceled;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatusFilter(s);
                    setIsFilterSheetOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 h-12 rounded-lg text-xs font-black uppercase tracking-widest transition-all border text-left flex items-center gap-3",
                    statusFilter === s
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white/40 border-white/5",
                  )}
                >
                  <StatusIcon className="size-4" />
                  <span className="flex-1">
                    {status.label} ({count})
                  </span>
                  {statusFilter === s && <Check className="size-4" />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <ScrollArea className="flex-1 sm:pr-4">
        <div className="flex flex-col gap-2 sm:gap-3 pb-10 px-1">
          {filteredOS.length > 0 ? (
            <>
              <div className="hidden sm:block">
                {filteredOS.map((os) => {
                  const status = STATUS_CONFIG[os.status];
                  const StatusIcon = status.icon;

                  return (
                    <Card
                      key={os.id}
                      className="group border-white/5 bg-zinc-950/40 hover:bg-white/[0.02] transition-all duration-300 mb-2"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row lg:items-center">
                          <div className="flex-1 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-white/5">
                            <div className="flex items-start gap-3 sm:gap-6">
                              <div
                                className={cn(
                                  "size-10 sm:size-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-105",
                                  os.status === "open"
                                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    : os.status === "in_progress"
                                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                      : os.status === "completed"
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20",
                                )}
                              >
                                <StatusIcon className="size-5 sm:size-6" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
                                    O.S. #{os.id.substring(0, 8)}
                                  </span>
                                  <Badge
                                    className={cn(
                                      "px-2 py-0 h-4 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.1em] border-0",
                                      status.color,
                                    )}
                                  >
                                    <StatusIcon className="size-2.5 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <Link
                                  href={`/dashboard/service/${os.id}`}
                                  className="group/link"
                                >
                                  <h3 className="text-sm sm:text-xl font-black text-white uppercase tracking-tighter group-hover/link:text-primary transition-colors leading-tight">
                                    {os.customer.name}
                                  </h3>
                                </Link>
                                <div className="flex items-center gap-2 sm:gap-3 text-white/40">
                                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] font-bold">
                                    <Car className="size-3 text-white/20" />
                                    {os.vehicle.marca} {os.vehicle.model}
                                  </div>
                                  <span className="text-white/10 hidden sm:inline">
                                    •
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] font-black text-white/60 bg-white/5 px-1.5 py-0.5 rounded">
                                    {os.vehicle.licensePlate}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="px-4 sm:px-5 py-3 sm:py-0 lg:py-0 lg:w-44 border-b lg:border-b-0 lg:border-r border-white/5 flex sm:flex-col justify-between sm:justify-center gap-1 sm:gap-0 bg-white/[0.01]">
                            <div>
                              <p className="text-[7px] sm:text-[9px] font-black text-white/20 uppercase tracking-widest">
                                Abertura
                              </p>
                              <p className="text-[9px] sm:text-xs font-bold text-white/70">
                                {format(
                                  new Date(os.createdAt),
                                  "dd MMM, yyyy",
                                  {
                                    locale: ptBR,
                                  },
                                )}
                              </p>
                            </div>
                            <div className="text-right sm:text-left">
                              <p className="text-[7px] sm:text-[9px] font-black text-primary/50 uppercase tracking-widest">
                                Total
                              </p>
                              <p className="text-sm sm:text-lg font-black italic tracking-tighter text-primary">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(os.totalAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="p-3 sm:p-4 lg:p-5 lg:flex-none bg-white/[0.01] flex items-center justify-end">
                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 w-full">
                              <div className="w-full sm:w-auto min-w-[120px]">
                                <PDFServiceOrderDownloadButtonOnly
                                  budget={os.budget}
                                />
                              </div>

                              <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 sm:h-9 flex-1 sm:flex-none sm:px-3 text-[9px] sm:text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-primary/50 transition-all gap-1 sm:gap-2"
                                  onClick={() => copyOSLink(os.id)}
                                >
                                  {copiedId === os.id ? (
                                    <Check className="size-3 text-emerald-500" />
                                  ) : (
                                    <Link2 className="size-3.5" />
                                  )}
                                  <span className="hidden sm:inline">Link</span>
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 sm:h-9 flex-1 sm:flex-none sm:px-3 text-[9px] sm:text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-emerald-500/50 transition-all gap-1 sm:gap-2"
                                  onClick={() => handleSendOSWhatsApp(os)}
                                >
                                  <Send className="size-3.5" />
                                  <span className="hidden sm:inline">Zap</span>
                                </Button>

                                <Link
                                  href={`/dashboard/service/${os.id}`}
                                  className="shrink-0"
                                >
                                  <Button
                                    variant="ghost"
                                    className="size-8 sm:size-9 p-0 flex-shrink-0 glow-primary-hover rounded-md"
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
                })}
              </div>

              <div className="sm:hidden flex flex-col gap-2">
                {filteredOS.map((os) => (
                  <ServiceOrderCardMobile
                    key={os.id}
                    os={os}
                    onCopy={() => copyOSLink(os.id)}
                    onWhatsApp={() => handleSendOSWhatsApp(os)}
                    copiedId={copiedId}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 sm:py-20 text-center border-2 border-dashed border-white/5 rounded-xl sm:rounded-2xl bg-white/[0.01]">
              <FileText className="size-10 sm:size-12 text-white/10 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-lg font-black uppercase text-white/40 italic">
                Nenhuma ordem de serviço
              </h3>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
