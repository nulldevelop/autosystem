"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  AlertCircle,
  ArrowLeft,
  Car,
  CheckCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Loader2,
  Package,
  Send,
  User,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ServiceOrderPDF } from "../../budget/_components/ServiceOrderPDF";
import { updateServiceOrderStatus } from "../../service/_actions/update-service-order-status";
import type { ServiceOrderDetails } from "../_data-access/get-service-order-details";

const STATUS_CONFIG = {
  open: {
    label: "Aberta",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Clock,
  },
  in_progress: {
    label: "Em Execução",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
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
    icon: AlertCircle,
  },
};

interface ServiceOrderDetailsClientProps {
  serviceOrder: ServiceOrderDetails;
}

export function ServiceOrderDetailsClient({
  serviceOrder,
}: ServiceOrderDetailsClientProps) {
  const router = useRouter();
  const status =
    STATUS_CONFIG[serviceOrder.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.open;
  const StatusIcon = status.icon;

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

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100svh-100px)] overflow-hidden pb-2">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 px-1 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="size-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 shrink-0"
          >
            <ArrowLeft className="size-3.5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-1.5 py-0.5 rounded">
                OS #{serviceOrder.id.substring(0, 8)}
              </span>
              <Badge
                className={cn(
                  "px-1.5 py-0 h-4 text-[8px] font-black uppercase tracking-[0.1em] border-0",
                  status.color,
                )}
              >
                <StatusIcon className="size-2.5 mr-1" /> {status.label}
              </Badge>
            </div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">
              Ordem de <span className="text-primary">Serviço</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <div className="flex gap-2 bg-white/[0.02] p-1 rounded-lg border border-white/5">
            {serviceOrder.status === "open" ||
            serviceOrder.status === "in_progress" ? (
              <Button
                onClick={handleFinalize}
                className="bg-green-600 text-black hover:bg-green-700 gap-2 font-black uppercase italic h-9 px-5 text-xs rounded-md shadow-lg shadow-green-600/10"
              >
                <CheckCircle className="size-3.5" /> Finalizar O.S.
              </Button>
            ) : null}
            <PDFDownloadLink
              document={<ServiceOrderPDF budget={serviceOrder.budget as any} />}
              fileName={`OS-${serviceOrder.id.substring(0, 8)}.pdf`}
              className="h-9 px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:bg-white/10 gap-2 rounded-md flex items-center justify-center"
            >
              {({ loading }) => (
                <>
                  {loading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <FileText className="size-3.5" />
                  )}
                  Baixar O.S.
                </>
              )}
            </PDFDownloadLink>
            <Button className="bg-primary text-black hover:bg-primary/90 gap-2 font-black uppercase italic h-9 px-5 text-xs rounded-md shadow-lg shadow-primary/10">
              <Send className="size-3.5" /> Enviar para Cliente
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden flex-1">
        {/* Coluna da Esquerda: Resumo */}
        <ScrollArea className="lg:col-span-1 h-full pr-2">
          <div className="space-y-4 pb-4">
            {/* Card Cliente */}
            <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 py-2 px-4">
                <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <User className="size-3 text-primary" /> Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-base font-black text-white uppercase tracking-tighter leading-tight">
                  {serviceOrder.customer.name}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5 font-medium">
                  {serviceOrder.customer.phone || "Sem telefone"}
                </p>
                <p className="text-[10px] text-white/40 font-medium">
                  {serviceOrder.customer.email || "Sem e-mail"}
                </p>
              </CardContent>
            </Card>

            {/* Card Veículo */}
            <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 py-2 px-4">
                <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <Car className="size-3 text-primary" /> Veículo Técnico
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-black text-white uppercase tracking-tighter leading-tight">
                      {serviceOrder.vehicle.marca} {serviceOrder.vehicle.model}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1.5 bg-primary/5 border-primary/20 text-primary text-[9px] font-black px-1.5 h-4"
                    >
                      {serviceOrder.vehicle.licensePlate}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                      Ano
                    </p>
                    <p className="text-xs font-bold text-white">
                      {serviceOrder.vehicle.year}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financeiro */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3">
                <DollarSign className="size-8 text-primary/10 -rotate-12" />
              </div>
              <CardContent className="p-4">
                <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] mb-0.5">
                  Total da O.S.
                </p>
                <p className="text-2xl font-black italic tracking-tighter text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(serviceOrder.totalAmount)}
                </p>
                <div className="mt-3 pt-3 border-t border-primary/10 flex justify-between items-center">
                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                    Financeiro
                  </span>
                  <Badge
                    className={cn(
                      "px-2 py-0 h-4 text-[8px] font-black uppercase border-0",
                      serviceOrder.transaction?.status === "PAID"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-yellow-500/10 text-yellow-500",
                    )}
                  >
                    {serviceOrder.transaction?.status === "PAID"
                      ? "RECEBIDO"
                      : "PENDENTE NO CAIXA"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Galeria herdada do Orçamento */}
            <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 py-2 px-4">
                <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <ImageIcon className="size-3 text-primary" /> Evidências do
                  Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {serviceOrder.budget.photos?.length > 0 ? (
                    serviceOrder.budget.photos.map(
                      (photo: any, idx: number) => (
                        <div
                          key={idx}
                          className="aspect-square relative rounded-md overflow-hidden border border-white/5 group"
                        >
                          <Image
                            src={photo.url}
                            alt={`Evidência ${idx + 1}`}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                      ),
                    )
                  ) : (
                    <div className="col-span-4 py-6 text-center border border-dashed border-white/10 rounded-md">
                      <ImageIcon className="size-4 text-white/5 mx-auto mb-1" />
                      <p className="text-[8px] font-black text-white/20 uppercase">
                        Sem fotos vinculadas
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Coluna da Direita: Itens */}
        <div className="lg:col-span-2 h-full overflow-hidden">
          <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 py-2 px-4 flex flex-row items-center justify-between shrink-0">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                <Package className="size-3.5 text-primary" /> Lista de Execução
              </CardTitle>
              <span className="text-[8px] font-black text-white/20 uppercase">
                {serviceOrder.items.length} itens
              </span>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="sticky top-0 bg-zinc-950 z-10 shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                    <tr className="bg-white/[0.02]">
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest">
                        SKU
                      </th>
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest">
                        Descrição
                      </th>
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest text-center">
                        Qtd
                      </th>
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest text-right">
                        Unitário
                      </th>
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceOrder.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                      >
                        <td className="p-3">
                          <span className="font-mono text-[9px] text-white/40 group-hover:text-primary transition-colors">
                            {item.product.sku ||
                              item.product.id.substring(0, 6)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-[11px] leading-none">
                              {item.product.name}
                            </span>
                            <span className="text-[7px] uppercase font-black text-white/20 mt-1">
                              {item.product.category || "Geral"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-[11px] font-bold text-white/70">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] font-bold text-white/40">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(item.unitPrice)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] font-black text-primary italic">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(item.unitPrice * item.quantity)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
