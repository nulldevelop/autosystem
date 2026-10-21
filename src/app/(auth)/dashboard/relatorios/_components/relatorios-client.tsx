"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign,
  Download,
  LineChart,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReportPDF } from "./report-pdf";

interface RelatoriosClientProps {
  // biome-ignore lint/suspicious/noExplicitAny: formato agregado vem da camada de dados
  data: any;
  // biome-ignore lint/suspicious/noExplicitAny: organização repassada ao PDF
  organization?: any;
}

const CATEGORY_NAMES: Record<string, string> = {
  SERVICE: "Serviços",
  PRODUCT: "Produtos",
  OTHER: "Outros",
  RENT: "Aluguel",
  SALARY: "Salários",
  TAX: "Impostos",
  "N/A": "Não informado",
  BRAINTREE: "Cartão de crédito",
  PIX: "PIX",
  CASH: "Dinheiro",
  DEBIT: "Débito",
  CREDIT: "Crédito",
  TRANSFER: "Transferência",
  BOLETO: "Boleto",
};

const BAR_COLORS = ["bg-primary", "bg-info", "bg-warning", "bg-foreground/40"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

const friendlyName = (key: string) => CATEGORY_NAMES[key] || key;

function Panel({
  title,
  description,
  aside,
  children,
  className,
}: {
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-card", className)}>
      <header className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {aside}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "success" | "danger";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface px-3.5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "num text-sm font-semibold",
          tone === "success" && "text-success",
          tone === "danger" && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function RelatoriosClient({
  data,
  organization,
}: RelatoriosClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(
    searchParams.get("from") || format(startOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("to") || format(endOfMonth(new Date()), "yyyy-MM-dd"),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", startDate);
    params.set("to", endDate);
    router.push(`?${params.toString()}`);
  };

  const revenueOverTime: { date: string; amount: number }[] =
    data.revenueOverTime || [];
  const maxRevenue = Math.max(...revenueOverTime.map((d) => d.amount), 1);
  const categories = Object.entries(data.revenueByCategory) as [
    string,
    number,
  ][];
  const paymentMethods = Object.entries(data.revenueByPaymentMethod) as [
    string,
    number,
  ][];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Desempenho da oficina no período selecionado."
        actions={
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto sm:[&>*]:w-auto">
            <div className="space-y-1.5">
              <Label htmlFor="report-from">De</Label>
              <Input
                id="report-from"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-to">Até</Label>
              <Input
                id="report-to"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={handleFilter} variant="secondary">
              Filtrar
            </Button>
            {mounted ? (
              <PDFDownloadLink
                key={`${startDate}-${endDate}-${organization?.id}`}
                document={
                  <ReportPDF
                    data={data}
                    period={{
                      start: parseISO(startDate),
                      end: parseISO(endDate),
                    }}
                    organization={organization}
                  />
                }
                fileName={`relatorio-performance-${startDate}-a-${endDate}.pdf`}
              >
                {({ loading }) => (
                  <Button disabled={loading}>
                    <Download />
                    {loading ? "Gerando…" : "Exportar PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            ) : (
              <Button disabled>
                <Download />
                Exportar PDF
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Faturamento"
          value={formatCurrency(data.metrics.totalRevenue)}
          hint="Total bruto"
          icon={DollarSign}
          tone="primary"
        />
        <StatCard
          label="Lucro líquido"
          value={formatCurrency(data.metrics.totalNet)}
          hint="Faturamento − custos"
          icon={TrendingUp}
          tone="primary"
        />
        <StatCard
          label="Ticket médio"
          value={formatCurrency(data.metrics.averageTicket)}
          hint="Por atendimento"
          icon={Target}
          tone="info"
        />
        <StatCard
          label="Conversão"
          value={`${data.metrics.conversionRate.toFixed(1)}%`}
          hint="Orçamentos aprovados"
          icon={LineChart}
          tone="info"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="Receita diária"
          description="Evolução do faturamento no período"
          aside={
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total do período</p>
              <p className="num font-display text-lg font-semibold text-primary">
                {formatCurrency(data.metrics.totalRevenue)}
              </p>
            </div>
          }
        >
          {revenueOverTime.length > 0 ? (
            <div className="flex h-64 items-end gap-1.5 pt-10">
              {revenueOverTime.map((item) => (
                <div
                  key={item.date}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="relative w-full rounded-t-md bg-primary/35 transition-colors group-hover:bg-primary"
                    style={{
                      height: `${Math.max((item.amount / maxRevenue) * 100, 4)}%`,
                    }}
                  >
                    <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                  <span className="num text-xs text-muted-foreground">
                    {format(parseISO(item.date), "dd/MM", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              Nenhum dado financeiro no período.
            </p>
          )}
        </Panel>

        <Panel
          title="Divisão por categoria"
          description="Participação na receita total"
        >
          {categories.length > 0 ? (
            <ul className="space-y-5">
              {categories.map(([label, value], i) => {
                const percentage = data.metrics.totalRevenue
                  ? (value / data.metrics.totalRevenue) * 100
                  : 0;
                return (
                  <li key={label} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {friendlyName(label)}
                      </span>
                      <span className="num font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          BAR_COLORS[i % BAR_COLORS.length],
                        )}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="num text-right text-xs text-muted-foreground">
                      {formatCurrency(value)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              Sem categorias no período.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel title="Meios de pagamento">
          <div className="space-y-2">
            {paymentMethods.length > 0 ? (
              paymentMethods.map(([method, val]) => (
                <Row
                  key={method}
                  label={friendlyName(method)}
                  value={formatCurrency(val)}
                />
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum pagamento no período.
              </p>
            )}
          </div>
        </Panel>

        <Panel title="Operacional">
          <div className="space-y-2">
            <Row label="O.S. concluídas" value={data.metrics.completedOS} />
            <Row label="Novos clientes" value={data.metrics.newCustomers} />
            <Row
              label="Taxa de conversão"
              value={`${data.metrics.conversionRate.toFixed(1)}%`}
              tone="success"
            />
          </div>
        </Panel>

        <Panel title="Resumo financeiro">
          <div className="space-y-2">
            <Row
              label="Faturamento"
              value={formatCurrency(data.metrics.totalRevenue)}
            />
            <Row
              label="Custo total"
              value={`−${formatCurrency(data.metrics.totalCost)}`}
              tone="danger"
            />
            <Row
              label="Lucro real"
              value={formatCurrency(data.metrics.totalNet)}
              tone="success"
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
