"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { TransactionType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { ReceiptPDF } from "./ReceiptPDF";
import { TransactionFormModal } from "./transaction-form-modal";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  costAmount: number;
  netAmount: number;
  type: "INCOME" | "EXPENSE";
  status: "PENDING" | "PAID" | "CANCELLED";
  category: string;
  createdAt: Date;
  serviceOrder?: any;
}

interface FinanceiroClientProps {
  data: {
    transactions: Transaction[];
    stats: {
      totalBalance: number;
      pendingReceivable: number;
      monthlyExpenses: number;
      totalGross: number;
      totalPartsCost: number;
      totalNet: number;
    };
  };
  organization?: {
    id: string;
    name: string;
    logo?: string | null;
    phone?: string | null;
    cnpj?: string | null;
    address?: string | null;
  } | null;
}

function StatCardMobile({
  icon: Icon,
  label,
  value,
  valueColor = "text-white",
  iconColor,
  borderClass,
  bgClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
  iconColor?: string;
  borderClass?: string;
  bgClass?: string;
}) {
  return (
    <Card className={cn("relative overflow-hidden", borderClass, bgClass)}>
      <CardHeader className="pb-2 px-3 py-2">
        <CardTitle className="text-[8px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
          <Icon className={cn("size-3", iconColor)} /> {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div
          className={cn(
            "text-lg font-black italic tracking-tighter",
            valueColor,
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionCardMobile({
  transaction,
  organization,
}: {
  transaction: Transaction;
  organization: FinanceiroClientProps["organization"];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-white/5 bg-zinc-950/40 overflow-hidden">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div
            className={cn(
              "size-9 rounded-lg flex items-center justify-center shrink-0 border",
              transaction.type === "INCOME"
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-secondary/10 text-secondary border-secondary/20",
            )}
          >
            {transaction.type === "INCOME" ? (
              <ArrowUpRight className="size-4" />
            ) : (
              <ArrowDownRight className="size-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[6px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-1 py-0.5 rounded truncate max-w-[80px]">
                {transaction.category === "SERVICE"
                  ? "OS"
                  : transaction.category}
              </span>
              <Badge
                className={cn(
                  "px-1 py-0 h-3.5 text-[5px] font-black uppercase tracking-[0.05em] border-0 shrink-0",
                  transaction.status === "PAID"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-yellow-500/10 text-yellow-500",
                )}
              >
                {transaction.status === "PAID" ? (
                  <CheckCircle2 className="size-2 mr-0.5" />
                ) : (
                  <Clock className="size-2 mr-0.5" />
                )}
                {transaction.status === "PAID" ? "PAGO" : "PEND"}
              </Badge>
            </div>

            <h3 className="text-xs font-black text-white uppercase tracking-tight leading-tight mt-0.5 truncate">
              {transaction.description}
            </h3>

            <div className="flex items-center gap-1 text-white/30">
              <Calendar className="size-2" />
              <span className="text-[7px] font-bold uppercase">
                {format(new Date(transaction.createdAt), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            {transaction.type === "INCOME" ? (
              <>
                <p className="text-[9px] font-bold text-white/40">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(transaction.amount)}
                </p>
                <p className="text-xs font-black italic text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(transaction.netAmount)}
                </p>
              </>
            ) : (
              <p className="text-xs font-black italic text-secondary">
                -
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(transaction.amount)}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full py-1 text-[7px] font-black text-white/30 uppercase tracking-widest border-t border-white/5"
        >
          {expanded ? "OCULTAR" : "DETALHES"}
        </button>

        {expanded && (
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <div className="flex justify-between text-[8px]">
              <span className="text-white/30 font-bold uppercase">Bruto:</span>
              <span className="text-white/70 font-black">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(transaction.amount)}
              </span>
            </div>
            {transaction.type === "INCOME" && (
              <>
                <div className="flex justify-between text-[8px]">
                  <span className="text-white/30 font-bold uppercase">
                    Peças:
                  </span>
                  <span className="text-yellow-500/60 font-black">
                    -
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(transaction.costAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-[8px]">
                  <span className="text-primary/50 font-bold uppercase">
                    Líquido:
                  </span>
                  <span className="text-primary font-black">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(transaction.netAmount)}
                  </span>
                </div>
              </>
            )}

            <div className="pt-2">
              {transaction.status === "PENDING" ? (
                <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 text-[7px] font-black uppercase h-7">
                  Baixar
                </Button>
              ) : (
                <PDFDownloadLink
                  document={
                    <ReceiptPDF
                      transaction={transaction as any}
                      organization={organization as any}
                    />
                  }
                  fileName={`recibo-${transaction.id.substring(0, 8)}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant="outline"
                      className="w-full border-white/5 bg-white/5 text-[7px] font-black uppercase h-7"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <FileText className="w-2.5 h-2.5 mr-1" />
                      )}
                      Recibo
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FinanceiroClient({
  data,
  organization,
}: FinanceiroClientProps) {
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>("INCOME");
  const [isStatsSheetOpen, setIsStatsSheetOpen] = useState(false);

  const openModal = (type: TransactionType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const filteredTransactions = data.transactions.filter((t) =>
    filter === "ALL" ? true : t.type === filter,
  );

  return (
    <div className="flex flex-col gap-3 lg:gap-4 lg:h-[calc(100svh-100px)] lg:overflow-hidden h-screen overflow-hidden">
      <div className="flex flex-col gap-3 lg:gap-4 shrink-0 px-3 lg:px-1 overflow-y-auto lg:overflow-visible">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white">
              Gestão <span className="text-primary">Financeira</span>
            </h1>
            <p className="text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">
              Fluxo de caixa e lucratividade
            </p>
          </div>

          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              onClick={() => openModal("EXPENSE")}
              className="border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest h-10 sm:h-12 px-4 sm:px-6"
            >
              <Plus className="size-3 sm:size-4 mr-1.5 sm:mr-2 text-secondary" />
              <span className="hidden sm:inline">Nova</span> Despesa
            </Button>
            <Button
              onClick={() => openModal("INCOME")}
              className="glow-primary h-10 sm:h-12 px-4 sm:px-8 font-black uppercase italic tracking-tighter text-xs sm:text-sm"
            >
              <Plus className="size-3 sm:size-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Receita Manual</span>
              <span className="sm:hidden">Receita</span>
            </Button>
          </div>

          <div className="flex sm:hidden gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => openModal("EXPENSE")}
              className="flex-1 border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-wider h-10"
            >
              <Plus className="size-3 mr-1 text-secondary" /> Despesa
            </Button>
            <Button
              onClick={() => openModal("INCOME")}
              className="flex-1 glow-primary h-10 px-4 font-black uppercase italic tracking-tighter text-[9px]"
            >
              <Plus className="size-3 mr-1" /> Receita
            </Button>
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2 px-4 py-3">
                <CardTitle className="text-[9px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                  <DollarSign className="size-3" /> Saldo em Caixa
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl lg:text-2xl font-black italic tracking-tighter text-white">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(data.stats.totalBalance)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-zinc-950/50">
              <CardHeader className="pb-2 px-4 py-3">
                <CardTitle className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <TrendingUp className="size-3 text-emerald-500" /> Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl lg:text-2xl font-black italic tracking-tighter text-white">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(data.stats.totalGross)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-zinc-950/50">
              <CardHeader className="pb-2 px-4 py-3">
                <CardTitle className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Package className="size-3 text-yellow-500" /> Peças
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl lg:text-2xl font-black italic tracking-tighter text-white">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(data.stats.totalPartsCost)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-secondary/5">
              <CardHeader className="pb-2 px-4 py-3">
                <CardTitle className="text-[9px] font-black uppercase tracking-widest text-secondary/60 flex items-center gap-2">
                  <TrendingUp className="size-3" /> Lucro Líquido
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl lg:text-2xl font-black italic tracking-tighter text-secondary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(data.stats.totalNet)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:hidden">
          <StatCardMobile
            icon={DollarSign}
            label="Saldo"
            value={new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(data.stats.totalBalance)}
            valueColor="text-white"
          />
          <StatCardMobile
            icon={TrendingUp}
            label="Lucro"
            value={new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(data.stats.totalNet)}
            valueColor="text-secondary"
            borderClass="border-secondary/20"
            bgClass="bg-secondary/5"
          />
        </div>

        <Sheet open={isStatsSheetOpen} onOpenChange={setIsStatsSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="sm:hidden w-full py-2 bg-zinc-950/50 rounded-lg border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest"
            >
              Ver todos os indicadores
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="bg-zinc-950 border-white/5 max-h-[70vh]"
          >
            <SheetHeader>
              <SheetTitle className="text-white font-black uppercase tracking-wider text-sm">
                Indicadores Financeiros
              </SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 gap-3 mt-4 overflow-y-auto pb-4">
              <StatCardMobile
                icon={DollarSign}
                label="Saldo em Caixa"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(data.stats.totalBalance)}
                borderClass="border-primary/20"
                bgClass="bg-primary/5"
              />
              <StatCardMobile
                icon={TrendingUp}
                label="Faturamento Bruto"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(data.stats.totalGross)}
                iconColor="text-emerald-500"
              />
              <StatCardMobile
                icon={Package}
                label="Investimento em Peças"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(data.stats.totalPartsCost)}
                iconColor="text-yellow-500"
              />
              <StatCardMobile
                icon={TrendingUp}
                label="Lucro Líquido"
                value={new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(data.stats.totalNet)}
                valueColor="text-secondary"
                borderClass="border-secondary/20"
                bgClass="bg-secondary/5"
              />
              <Card className="border-white/5 bg-zinc-950/50 col-span-2">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                        Provisionado
                      </p>
                      <p className="text-sm font-black text-yellow-500">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(data.stats.pendingReceivable)}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-right">
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                        Despesas Mês
                      </p>
                      <p className="text-sm font-black text-white/70">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(data.stats.monthlyExpenses)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-zinc-950/50 p-2.5 sm:p-3 rounded-xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <Button
              onClick={() => setFilter("ALL")}
              variant={filter === "ALL" ? "default" : "ghost"}
              className={cn(
                "text-[8px] sm:text-[9px] font-black uppercase tracking-widest h-8 sm:h-9 px-3 sm:px-5 shrink-0",
                filter === "ALL" && "bg-white text-black",
              )}
            >
              Todas
            </Button>
            <Button
              onClick={() => setFilter("INCOME")}
              variant={filter === "INCOME" ? "default" : "ghost"}
              className={cn(
                "text-[8px] sm:text-[9px] font-black uppercase tracking-widest h-8 sm:h-9 px-3 sm:px-5 shrink-0",
                filter === "INCOME" &&
                  "bg-emerald-500 text-black hover:bg-emerald-600",
              )}
            >
              Entradas
            </Button>
            <Button
              onClick={() => setFilter("EXPENSE")}
              variant={filter === "EXPENSE" ? "default" : "ghost"}
              className={cn(
                "text-[8px] sm:text-[9px] font-black uppercase tracking-widest h-8 sm:h-9 px-3 sm:px-5 shrink-0",
                filter === "EXPENSE" &&
                  "bg-secondary text-black hover:bg-secondary/90",
              )}
            >
              Saídas
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                Provisionado
              </span>
              <span className="text-xs font-black text-yellow-500">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(data.stats.pendingReceivable)}
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                Despesas Mês
              </span>
              <span className="text-xs font-black text-white/70">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(data.stats.monthlyExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <TransactionFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultType={modalType}
      />

      <div className="flex-1 overflow-y-auto px-3 lg:px-1 lg:pr-4 pb-20">
        <div className="flex flex-col gap-2 sm:gap-3 pb-4">
          {filteredTransactions.length > 0 ? (
            <>
              <div className="hidden sm:block">
                {filteredTransactions.map((t) => (
                  <Card
                    key={t.id}
                    className="group border-white/5 bg-zinc-950/40 hover:bg-white/[0.02] transition-all duration-300 mb-2"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row lg:items-center">
                        <div className="flex-1 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-white/5">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div
                              className={cn(
                                "size-10 sm:size-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-110 duration-500",
                                t.type === "INCOME"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : "bg-secondary/10 text-secondary border-secondary/20",
                              )}
                            >
                              {t.type === "INCOME" ? (
                                <ArrowUpRight className="size-5 sm:size-6" />
                              ) : (
                                <ArrowDownRight className="size-5 sm:size-6" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded">
                                  {t.category === "SERVICE"
                                    ? "ORDEM DE SERVIÇO"
                                    : t.category}
                                </span>
                                <Badge
                                  className={cn(
                                    "px-2 py-0 h-4 text-[7px] sm:text-[8px] font-black uppercase tracking-[0.1em] border-0",
                                    t.status === "PAID"
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : "bg-yellow-500/10 text-yellow-500",
                                  )}
                                >
                                  {t.status === "PAID" ? (
                                    <CheckCircle2 className="size-2.5 mr-1" />
                                  ) : (
                                    <Clock className="size-2.5 mr-1" />
                                  )}
                                  {t.status === "PAID" ? "PAGO" : "PENDENTE"}
                                </Badge>
                              </div>
                              <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors leading-tight">
                                {t.description}
                              </h3>
                              <div className="flex items-center gap-3 text-white/40">
                                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase">
                                  <Calendar className="size-3 text-white/20" />
                                  {format(
                                    new Date(t.createdAt),
                                    "dd 'de' MMMM, yyyy",
                                    { locale: ptBR },
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="px-4 sm:px-5 py-3 sm:py-0 lg:py-0 lg:w-[320px] xl:w-[350px] border-b lg:border-b-0 lg:border-r border-white/5 flex items-center justify-between gap-4 sm:gap-6 bg-white/[0.01]">
                          <div className="text-center shrink-0">
                            <p className="text-[7px] sm:text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
                              Bruto
                            </p>
                            <p className="text-xs sm:text-sm font-bold text-white/70">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(t.amount)}
                            </p>
                          </div>

                          {t.type === "INCOME" && (
                            <>
                              <div className="h-8 w-px bg-white/5 shrink-0" />
                              <div className="text-center shrink-0">
                                <p className="text-[7px] sm:text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
                                  Peças
                                </p>
                                <p className="text-xs sm:text-sm font-bold text-yellow-500/60">
                                  -
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(t.costAmount)}
                                </p>
                              </div>
                              <div className="h-8 w-px bg-white/5 shrink-0" />
                              <div className="text-center shrink-0">
                                <p className="text-[7px] sm:text-[8px] font-black text-primary/50 uppercase tracking-widest mb-1">
                                  Líquido
                                </p>
                                <p className="text-sm sm:text-lg font-black italic tracking-tighter text-primary">
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(t.netAmount)}
                                </p>
                              </div>
                            </>
                          )}

                          {t.type === "EXPENSE" && (
                            <div className="flex-1 text-right pr-2 sm:pr-4">
                              <p className="text-[7px] sm:text-[8px] font-black text-secondary/50 uppercase tracking-widest mb-1">
                                Saída Total
                              </p>
                              <p className="text-base sm:text-xl font-black italic tracking-tighter text-secondary">
                                -
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(t.amount)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="p-3 sm:p-4 sm:lg:p-5 lg:w-[130px] xl:w-[150px] flex items-center justify-center gap-2">
                          {t.status === "PENDING" ? (
                            <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 text-[9px] sm:text-[10px] font-black uppercase h-8 sm:h-9">
                              Baixar
                            </Button>
                          ) : (
                            <PDFDownloadLink
                              document={
                                <ReceiptPDF
                                  transaction={t as any}
                                  organization={organization as any}
                                />
                              }
                              fileName={`recibo-${t.id.substring(0, 8)}.pdf`}
                            >
                              {({ loading }) => (
                                <Button
                                  variant="outline"
                                  className="w-full border-white/5 bg-white/5 text-[9px] sm:text-[10px] font-black uppercase h-8 sm:h-9"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <FileText className="w-3 h-3" />
                                  )}
                                  <span className="ml-1">Baixar</span>
                                </Button>
                              )}
                            </PDFDownloadLink>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="sm:hidden flex flex-col gap-2">
                {filteredTransactions.map((t) => (
                  <TransactionCardMobile
                    key={t.id}
                    transaction={t}
                    organization={organization}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 sm:py-24 text-center border-2 border-dashed border-white/5 rounded-2xl sm:rounded-[2rem] bg-white/[0.01]">
              <ArrowRightLeft className="size-10 sm:size-12 text-white/10 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-xl font-black uppercase text-white/40 italic">
                Nenhuma movimentação
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
