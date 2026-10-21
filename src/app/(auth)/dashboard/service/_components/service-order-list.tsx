"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Check, Clock, Link2, Send, Wrench } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Plate } from "@/components/app/plate";
import { StatCard } from "@/components/app/stat-card";
import { ServiceStatusBadge } from "@/components/app/status-badge";
import { Segmented, SearchInput } from "@/components/app/toolbar";
import { Button } from "@/components/ui/button";
import type {
  ServiceOrder,
  ServiceOrderStatus,
} from "@/generated/prisma/client";
import type { BudgetWithRelations } from "@/types/budget";
import { PDFServiceOrderDownloadButtonOnly } from "./PDFServiceOrderDownloadButtonOnly";

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

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function ServiceOrderList({ serviceOrders }: ServiceOrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | "all">(
    "all",
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const count = (status: ServiceOrderStatus) =>
    serviceOrders.filter((os) => os.status === status).length;

  const filteredOS = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return serviceOrders.filter((os) => {
      const matchesSearch =
        os.customer.name.toLowerCase().includes(term) ||
        os.vehicle.model.toLowerCase().includes(term) ||
        os.vehicle.licensePlate?.toLowerCase().includes(term) ||
        os.id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" || os.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [serviceOrders, searchTerm, statusFilter]);

  const copyOSLink = (id: string) => {
    const link = `${window.location.origin}/service/sign/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    toast.success("Link de assinatura da O.S. copiado");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendOSWhatsApp = async (os: ServiceOrderWithBudget) => {
    const budget = os.budget;

    const itemsStr = budget.items
      .map(
        (i) =>
          `• ${i.product.name} (${i.quantity}x) - ${brl(i.quantity * i.unitPrice)}`,
      )
      .join("\n");

    const message = `*ORDEM DE SERVIÇO - ${budget.organization?.name || "AutoSystem"}*\nO.S. #${os.id.substring(0, 8)}\n\n*CLIENTE:* ${os.customer.name}\n*VEÍCULO:* ${os.vehicle.marca || ""} ${os.vehicle.model} (${os.vehicle.licensePlate || "N/A"})\n\n*SERVIÇOS EM EXECUÇÃO:*\n${itemsStr}\n\n*VALOR TOTAL:* ${brl(os.totalAmount)}\n\n*Assinar e acompanhar online:*\n${window.location.origin}/service/sign/${os.id}`;

    const url = `https://api.whatsapp.com/send?phone=${os.customer.phone?.replace(/\D/g, "")}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    toast.success("WhatsApp aberto com a O.S.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordens de serviço"
        description="Serviços em andamento na oficina. Cada O.S. nasce de um orçamento aprovado."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Abertas"
          value={count("open")}
          hint="Aguardando início"
          icon={Clock}
          tone="info"
        />
        <StatCard
          label="Em andamento"
          value={count("in_progress")}
          hint="Na bancada"
          icon={Wrench}
          tone="warning"
        />
        <StatCard
          label="Concluídas"
          value={count("completed")}
          hint="Prontas para entrega"
          icon={Check}
          tone="primary"
        />
        <StatCard
          label="Total"
          value={serviceOrders.length}
          hint="Todas as O.S."
          icon={Wrench}
          tone="neutral"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por cliente, veículo ou placa"
        />
        <Segmented
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Todas", count: serviceOrders.length },
            { value: "open", label: "Abertas" },
            { value: "in_progress", label: "Em andamento" },
            { value: "completed", label: "Concluídas" },
            { value: "canceled", label: "Canceladas" },
          ]}
        />
      </div>

      {filteredOS.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="Nenhuma ordem de serviço encontrada"
          description={
            searchTerm || statusFilter !== "all"
              ? "Nada bate com a busca ou o filtro atual."
              : "Aprove um orçamento para gerar a primeira ordem de serviço."
          }
        />
      ) : (
        <ul className="space-y-3">
          {filteredOS.map((os) => (
            <li
              key={os.id}
              className="overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/30"
            >
              <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <Link
                  href={`/dashboard/service/${os.id}`}
                  className="group min-w-0 flex-1 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <ServiceStatusBadge status={os.status} />
                    <span className="num font-mono text-xs text-muted-foreground">
                      O.S. #{os.id.substring(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(os.createdAt), "dd MMM yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
                    {os.customer.name}
                  </h3>
                  <div className="flex min-w-0 items-center gap-2">
                    <Plate value={os.vehicle.licensePlate} />
                    <span className="truncate text-sm text-muted-foreground">
                      {os.vehicle.marca} {os.vehicle.model}
                    </span>
                  </div>
                </Link>

                <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end lg:justify-center">
                  <span className="text-sm text-muted-foreground lg:hidden">
                    Total
                  </span>
                  <p className="num font-display text-xl font-semibold">
                    {brl(os.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t bg-surface px-4 py-3 sm:px-5">
                <PDFServiceOrderDownloadButtonOnly budget={os.budget} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyOSLink(os.id)}
                >
                  {copiedId === os.id ? (
                    <Check className="text-success" />
                  ) : (
                    <Link2 />
                  )}
                  {copiedId === os.id ? "Copiado" : "Link"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendOSWhatsApp(os)}
                >
                  <Send className="text-success" />
                  WhatsApp
                </Button>
                <Button asChild variant="ghost" size="sm" className="ml-auto">
                  <Link href={`/dashboard/service/${os.id}`}>
                    Abrir <ArrowRight />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
