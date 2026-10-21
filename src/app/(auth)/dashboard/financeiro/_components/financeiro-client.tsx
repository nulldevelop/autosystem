"use client";

import dynamic from "next/dynamic";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  DollarSign,
  FileText,
  Loader2,
  Package,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Segmented } from "@/components/app/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  // biome-ignore lint/suspicious/noExplicitAny: formato vem do Prisma com includes variáveis
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

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false, loading: () => <ReceiptButtonPlaceholder /> },
);

function ReceiptButtonPlaceholder() {
  return (
    <Button variant="outline" size="sm" disabled>
      <FileText /> Recibo
    </Button>
  );
}

const CATEGORY_LABEL: Record<string, string> = {
  SERVICE: "Ordem de serviço",
  PRODUCT: "Peças",
  RENT: "Aluguel",
  SALARY: "Salários",
  TAX: "Impostos",
  OTHER: "Outros",
};

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

type Filter = "ALL" | "INCOME" | "EXPENSE";

export function FinanceiroClient({
  data,
  organization,
}: FinanceiroClientProps) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"INCOME" | "EXPENSE">("INCOME");

  const openModal = (type: "INCOME" | "EXPENSE") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const filteredTransactions = data.transactions.filter((t) =>
    filter === "ALL" ? true : t.type === filter,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Receitas, despesas e lucro da oficina."
        actions={
          <>
            <Button variant="outline" onClick={() => openModal("EXPENSE")}>
              <Plus className="text-destructive" /> Nova despesa
            </Button>
            <Button onClick={() => openModal("INCOME")}>
              <Plus /> Nova receita
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Saldo em caixa"
          value={brl(data.stats.totalBalance)}
          hint="Saldo consolidado"
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Faturamento"
          value={brl(data.stats.totalGross)}
          hint="Total bruto"
          icon={TrendingUp}
          tone="info"
        />
        <StatCard
          label="Custo de peças"
          value={brl(data.stats.totalPartsCost)}
          hint="Investido em peças"
          icon={Package}
          tone="warning"
        />
        <StatCard
          label="Lucro líquido"
          value={brl(data.stats.totalNet)}
          hint="Faturamento − peças"
          icon={TrendingUp}
          tone="primary"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: "Todas", count: data.transactions.length },
            { value: "INCOME", label: "Entradas" },
            { value: "EXPENSE", label: "Saídas" },
          ]}
        />
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">A receber:</dt>
            <dd className="num font-semibold text-warning">
              {brl(data.stats.pendingReceivable)}
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-foreground">Despesas do mês:</dt>
            <dd className="num font-semibold">
              {brl(data.stats.monthlyExpenses)}
            </dd>
          </div>
        </dl>
      </div>

      <TransactionFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        defaultType={modalType}
      />

      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="Nenhuma movimentação encontrada"
          description="Registre receitas e despesas ou aprove ordens de serviço."
        />
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {filteredTransactions.map((t) => {
            const income = t.type === "INCOME";
            return (
              <li
                key={t.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      income
                        ? "bg-success/12 text-success"
                        : "bg-destructive/12 text-destructive",
                    )}
                  >
                    {income ? (
                      <ArrowUpRight className="size-5" aria-label="Entrada" />
                    ) : (
                      <ArrowDownRight className="size-5" aria-label="Saída" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant={t.status === "PAID" ? "success" : "warning"}
                      >
                        {t.status === "PAID" ? "Pago" : "Pendente"}
                      </Badge>
                      <span>{CATEGORY_LABEL[t.category] ?? t.category}</span>
                      <span aria-hidden>·</span>
                      <span>
                        {format(new Date(t.createdAt), "dd MMM yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p
                      className={cn(
                        "num font-display text-lg font-semibold",
                        income ? "text-success" : "text-destructive",
                      )}
                    >
                      {income ? "+" : "−"}
                      {brl(income ? t.netAmount : t.amount)}
                    </p>
                    {income && t.costAmount > 0 && (
                      <p className="num text-xs text-muted-foreground">
                        {brl(t.amount)} bruto − {brl(t.costAmount)} peças
                      </p>
                    )}
                  </div>
                  <PDFDownloadLink
                    document={
                      <ReceiptPDF
                        transaction={t as never}
                        organization={organization as never}
                      />
                    }
                    fileName={`recibo-${t.id.substring(0, 8)}.pdf`}
                  >
                    {({ loading }) => (
                      <Button variant="outline" size="sm" disabled={loading}>
                        {loading ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <FileText />
                        )}
                        Recibo
                      </Button>
                    )}
                  </PDFDownloadLink>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
