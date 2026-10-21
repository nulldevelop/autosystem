"use client";

import {
  ArrowLeft,
  Car,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Loader2,
  Send,
  User,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LineItems } from "@/components/app/line-items";
import { Plate } from "@/components/app/plate";
import { ServiceStatusBadge } from "@/components/app/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceOrderPDF } from "../../budget/_components/ServiceOrderPDF";
import { updateServiceOrderStatus } from "../../service/_actions/update-service-order-status";
import type { ServiceOrderDetails } from "../_data-access/get-service-order-details";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" disabled>
        <FileText /> Baixar O.S.
      </Button>
    ),
  },
);

interface ServiceOrderDetailsClientProps {
  serviceOrder: ServiceOrderDetails;
}

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4 text-primary" aria-hidden />
          {title}
        </h2>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function ServiceOrderDetailsClient({
  serviceOrder,
}: ServiceOrderDetailsClientProps) {
  const router = useRouter();
  const canFinalize =
    serviceOrder.status === "open" || serviceOrder.status === "in_progress";

  // A O.S. carrega cliente, veículo e itens fora do orçamento; o PDF os lê de `budget`.
  const pdfBudget = {
    ...serviceOrder.budget,
    customer: serviceOrder.customer,
    vehicle: serviceOrder.vehicle,
    items: serviceOrder.items,
    totalAmount: serviceOrder.totalAmount,
    serviceOrder,
  };

  const handleFinalize = async () => {
    const result = await updateServiceOrderStatus({
      serviceOrderId: serviceOrder.id,
      status: "completed",
    });

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleSend = () => {
    const phone = serviceOrder.customer.phone?.replace(/\D/g, "");
    if (!phone) {
      toast.error("O cliente não tem telefone cadastrado.");
      return;
    }
    const message = `Olá ${serviceOrder.customer.name}!\n\nSua ordem de serviço (${brl(serviceOrder.totalAmount)}) está disponível.\nPara acompanhar e assinar online:\n${window.location.origin}/service/sign/${serviceOrder.id}`;
    window.open(
      `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            aria-label="Voltar"
            className="shrink-0 rounded-full"
          >
            <ArrowLeft />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ServiceStatusBadge status={serviceOrder.status} />
              <span className="num font-mono text-xs text-muted-foreground">
                O.S. #{serviceOrder.id.substring(0, 8)}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Ordem de serviço de {serviceOrder.customer.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canFinalize && (
            <Button onClick={handleFinalize}>
              <CheckCircle /> Finalizar O.S.
            </Button>
          )}
          <PDFDownloadLink
            // biome-ignore lint/suspicious/noExplicitAny: type mismatch for pdf props
            document={<ServiceOrderPDF budget={pdfBudget as any} />}
            fileName={`OS-${serviceOrder.id.substring(0, 8)}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <FileText />}
                Baixar O.S.
              </Button>
            )}
          </PDFDownloadLink>
          <Button variant="outline" onClick={handleSend}>
            <Send className="text-success" /> Enviar ao cliente
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <InfoCard icon={User} title="Cliente">
            <p className="font-semibold">{serviceOrder.customer.name}</p>
            <p className="num text-sm text-muted-foreground">
              {serviceOrder.customer.phone || "Sem telefone"}
            </p>
            <p className="text-sm text-muted-foreground">
              {serviceOrder.customer.email || "Sem e-mail"}
            </p>
          </InfoCard>

          <InfoCard icon={Car} title="Veículo">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <p className="font-semibold">
                  {serviceOrder.vehicle.marca} {serviceOrder.vehicle.model}
                </p>
                <Plate value={serviceOrder.vehicle.licensePlate} />
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Ano</p>
                <p className="num font-medium">{serviceOrder.vehicle.year}</p>
              </div>
            </div>
          </InfoCard>

          <section className="rounded-xl border border-primary/30 bg-card p-4">
            <p className="text-sm text-muted-foreground">Total da O.S.</p>
            <p className="num font-display text-3xl font-semibold tracking-tight text-primary">
              {brl(serviceOrder.totalAmount)}
            </p>
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">Financeiro</span>
              <Badge
                variant={
                  serviceOrder.transaction?.status === "PAID"
                    ? "success"
                    : "warning"
                }
              >
                {serviceOrder.transaction?.status === "PAID"
                  ? "Recebido"
                  : "Pendente no caixa"}
              </Badge>
            </div>
          </section>

          <InfoCard icon={ImageIcon} title="Fotos do check-in">
            {serviceOrder.budget.photos?.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2">
                {/* biome-ignore lint/suspicious/noExplicitAny: photo type is dynamic */}
                {serviceOrder.budget.photos.map((photo: any, idx: number) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: photos are unique enough for index here
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={photo.url}
                      alt={`Foto ${idx + 1} do check-in`}
                      fill
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                Nenhuma foto vinculada ao orçamento.
              </p>
            )}
          </InfoCard>
        </div>

        <div className="lg:col-span-2">
          <LineItems items={serviceOrder.items} title="Lista de execução" />
        </div>
      </div>
    </div>
  );
}
