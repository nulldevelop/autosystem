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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportPDF } from "./report-pdf";

interface RelatoriosClientProps {
  data: any;
  organization?: any;
}

export function RelatoriosClient({
  data,
  organization,
}: RelatoriosClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryNames: Record<string, string> = {
    SERVICE: "Serviços",
    PRODUCT: "Produtos",
    OTHER: "Outros",
    "N/A": "Não informado",
    BRAINTREE: "Cartão de Crédito",
    PIX: "PIX",
    CASH: "Dinheiro",
    DEBIT: "Débito",
    CREDIT: "Crédito",
    TRANSFER: "Transferência",
    BOLETO: "Boleto",
  };

  const getFriendlyName = (key: string) => categoryNames[key] || key;

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const maxRevenue = Math.max(
    ...(data.revenueOverTime.map((d: any) => d.amount) || [0]),
    1,
  );

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white font-poppins">
            Performance <span className="text-primary">Analytics</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Métricas avançadas e inteligência de negócio
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-white/40 ml-1">
              De
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-white/40 ml-1">
              Até
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <Button
            onClick={handleFilter}
            variant="secondary"
            className="font-bold uppercase tracking-widest text-[10px] h-[38px]"
          >
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
                <Button
                  disabled={loading}
                  className="glow-primary uppercase font-bold tracking-widest text-[10px] h-[38px]"
                >
                  <Download className="mr-2 size-3" />
                  {loading ? "Gerando..." : "Exportar PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          ) : (
            <Button
              disabled
              className="glow-primary uppercase font-bold tracking-widest text-[10px] h-[38px]"
            >
              <Download className="mr-2 size-3" />
              Exportar PDF
            </Button>
          )}
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Faturamento Bruto",
            value: formatCurrency(data.metrics.totalRevenue),
            icon: DollarSign,
            color: "text-primary",
          },
          {
            label: "Lucro Líquido",
            value: formatCurrency(data.metrics.totalNet),
            icon: TrendingUp,
            color: "text-secondary",
          },
          {
            label: "Ticket Médio",
            value: formatCurrency(data.metrics.averageTicket),
            icon: Target,
            color: "text-blue-500",
          },
          {
            label: "Conversão",
            value: `${data.metrics.conversionRate.toFixed(1)}%`,
            icon: LineChart,
            color: "text-purple-500",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="border-white/5 bg-white/[0.02] overflow-hidden relative group"
          >
            <div
              className={`absolute top-0 right-0 p-8 -mr-4 -mt-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${item.color}`}
            >
              <item.icon className="size-16" />
            </div>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                  <item.icon className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/40">
                    {item.label}
                  </p>
                  <p className="text-xl font-black text-white">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-white/5 bg-white/[0.02] flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest">
                  Receita Diária
                </CardTitle>
                <p className="text-[10px] text-white/40 uppercase mt-1">
                  Evolução do faturamento no período
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase">
                  Total do Período
                </p>
                <p className="text-lg font-black text-primary">
                  {formatCurrency(data.metrics.totalRevenue)}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-end gap-1.5 px-6 pb-6 min-h-[300px]">
            {data.revenueOverTime.length > 0 ? (
              data.revenueOverTime.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-full bg-primary/20 hover:bg-primary transition-all duration-300 rounded-t-sm relative"
                    style={{
                      height: `${(item.amount / maxRevenue) * 200 + 10}px`,
                    }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                      {formatCurrency(item.amount)}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-white/30 uppercase group-hover:text-white/60 transition-colors">
                    {format(parseISO(item.date), "dd/MM", { locale: ptBR })}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-xs uppercase font-black italic">
                Nenhum dado financeiro no período
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Divisão por Categoria
            </CardTitle>
            <p className="text-[10px] text-white/40 uppercase mt-1">
              Participação na receita total
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {Object.entries(data.revenueByCategory).length > 0 ? (
              Object.entries(data.revenueByCategory).map(
                ([label, value]: any, i) => {
                  const percentage = (value / data.metrics.totalRevenue) * 100;
                  const colors = [
                    "bg-primary",
                    "bg-secondary",
                    "bg-blue-500",
                    "bg-purple-500",
                    "bg-orange-500",
                  ];
                  const color = colors[i % colors.length];

                  return (
                    <div key={label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/60">
                          {getFriendlyName(label)}
                        </span>
                        <span className="text-white">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} glow-primary shadow-current/20`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-white/40 font-bold text-right">
                        {formatCurrency(value)}
                      </div>
                    </div>
                  );
                },
              )
            ) : (
              <div className="w-full h-40 flex items-center justify-center text-white/20 text-xs uppercase font-black italic">
                Sem categorias
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Meios de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.revenueByPaymentMethod).map(
              ([method, val]: any) => (
                <div
                  key={method}
                  className="flex justify-between items-center p-3 rounded-lg bg-white/5"
                >
                  <span className="text-[10px] font-black uppercase text-white/60">
                    {getFriendlyName(method)}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {formatCurrency(val)}
                  </span>
                </div>
              ),
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Operacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-[10px] font-black uppercase text-white/60">
                OS Concluídas
              </span>
              <span className="text-sm font-bold text-white">
                {data.metrics.completedOS}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-[10px] font-black uppercase text-white/60">
                Novos Clientes
              </span>
              <span className="text-sm font-bold text-white">
                {data.metrics.newCustomers}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-[10px] font-black uppercase text-white/60">
                Taxa de Conversão
              </span>
              <span className="text-sm font-bold text-primary">
                {data.metrics.conversionRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-[10px] font-black uppercase text-white/60">
                Faturamento
              </span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(data.metrics.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <span className="text-[10px] font-black uppercase text-white/60">
                Custo Total
              </span>
              <span className="text-sm font-bold text-red-400">
                -{formatCurrency(data.metrics.totalCost)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-[10px] font-black uppercase text-primary">
                Lucro Real
              </span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(data.metrics.totalNet)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
