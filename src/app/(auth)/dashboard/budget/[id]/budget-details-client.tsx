"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Send, 
  Car, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Package,
  DollarSign,
  Image as ImageIcon,
  Maximize2,
  Plus,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { BudgetDetails } from "../_data-access/get-budget-details";
import { cn } from "@/lib/utils";
import { PDFDownloadButton } from "../_components/PDFDownloadButton";
import { PDFServiceOrderDownloadButton } from "../_components/PDFServiceOrderDownloadButton";
import Image from "next/image";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { addBudgetPhoto } from "../_actions/add-budget-photo";

const STATUS_CONFIG = {
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

interface BudgetDetailsClientProps {
  budget: BudgetDetails;
}

export function BudgetDetailsClient({ budget }: BudgetDetailsClientProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const status = STATUS_CONFIG[budget.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = status.icon;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", budget.organizationId || "");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        const result = await addBudgetPhoto(budget.id, data.url);
        if (result.success) {
          toast.success("Foto anexada com sucesso!");
          router.refresh();
        } else {
          toast.error(result.message || "Erro ao salvar foto.");
        }
      } else {
        toast.error(data.error || "Falha no upload.");
      }
    } catch (error) {
      toast.error("Erro ao realizar upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100svh-100px)] overflow-hidden pb-2">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-1 shrink-0">
        <div className="flex items-center gap-3 w-full md:w-auto">
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
                #{budget.id.substring(0, 8)}
              </span>
              <Badge className={cn("px-1.5 py-0 h-4 text-[8px] font-black uppercase tracking-[0.1em] border-0", status.color)}>
                <StatusIcon className="size-2.5 mr-1" /> {status.label}
              </Badge>
            </div>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">
              Detalhes do <span className="text-primary">Serviço</span>
            </h1>
          </div>
        </div>

        {/* Grupo de Ações - Alinhado em linha única */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-white/[0.02] p-1 rounded-lg border border-white/5">
            <div className="w-[120px]">
              <PDFDownloadButton budget={budget as any} />
            </div>
            <div className="w-[120px]">
              <PDFServiceOrderDownloadButton budget={budget as any} />
            </div>
            <Button className="bg-primary text-black hover:bg-primary/90 gap-2 font-black uppercase italic h-9 px-5 text-xs rounded-md shadow-lg shadow-primary/10">
              <Send className="size-3.5" /> Enviar
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden flex-1">
        <ScrollArea className="lg:col-span-1 h-full pr-2">
          <div className="space-y-4 pb-4">
            <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 py-2 px-4">
                <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <User className="size-3 text-primary" /> Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-base font-black text-white uppercase tracking-tighter leading-tight">
                  {budget.customer.name}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5 font-medium">{budget.customer.email || "Sem e-mail"}</p>
                <p className="text-[10px] text-white/40 font-medium">{budget.customer.phone || "Sem telefone"}</p>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 py-2 px-4">
                <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <Car className="size-3 text-primary" /> Veículo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-black text-white uppercase tracking-tighter leading-tight">
                      {budget.vehicle.marca} {budget.vehicle.model}
                    </p>
                    <Badge variant="outline" className="mt-1.5 bg-primary/5 border-primary/20 text-primary text-[9px] font-black px-1.5 h-4">
                      {budget.vehicle.licensePlate}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Ano</p>
                    <p className="text-xs font-bold text-white">{budget.vehicle.year}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">KM Atual</span>
                  <span className="text-xs font-bold text-white">{budget.kilometers ? `${budget.kilometers.toLocaleString()} km` : "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-white/[0.02] border-b border-white/5 py-2 px-4 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                  <ImageIcon className="size-3 text-primary" /> Galeria
                </CardTitle>
                <button 
                  className="size-5 bg-primary/10 text-primary hover:bg-primary/20 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="size-2.5 animate-spin" /> : <Plus className="size-2.5" />}
                </button>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {budget.photos?.length > 0 ? (
                    budget.photos.map((photo: any, idx: number) => (
                      <div key={idx} className="aspect-square relative rounded-md overflow-hidden border border-white/5 group cursor-pointer">
                        <Image 
                          src={photo.url} 
                          alt={`Evidência ${idx + 1}`} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="size-3 text-white" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div 
                      className="col-span-4 py-6 text-center border border-dashed border-white/10 rounded-md hover:border-primary/50 cursor-pointer transition-colors"
                      onClick={handleUploadClick}
                    >
                      <ImageIcon className="size-4 text-white/5 mx-auto mb-1" />
                      <p className="text-[8px] font-black text-white/20 uppercase">
                        {isUploading ? "Enviando..." : "Anexar Fotos"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-3">
                <DollarSign className="size-8 text-primary/10 -rotate-12" />
              </div>
              <CardContent className="p-4">
                <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] mb-0.5">Total do Orçamento</p>
                <p className="text-2xl font-black italic tracking-tighter text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.totalAmount)}
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="lg:col-span-2 h-full overflow-hidden">
          <Card className="border-white/5 bg-zinc-950/50 backdrop-blur-sm h-full flex flex-col">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 py-2 px-4 flex flex-row items-center justify-between shrink-0">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                <Package className="size-3 text-primary" /> Itens e Peças
              </CardTitle>
              <span className="text-[8px] font-black text-white/20 uppercase">{budget.items.length} itens</span>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="sticky top-0 bg-zinc-950 z-10 shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                    <tr className="bg-white/[0.02]">
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest">SKU</th>
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest">Descrição</th>
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest text-center">Qtd</th>
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest text-right">Unitário</th>
                      <th className="p-3 text-[8px] font-black uppercase text-white/20 tracking-widest text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.items.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                        <td className="p-3">
                          <span className="font-mono text-[9px] text-white/40 group-hover:text-primary transition-colors">
                            {item.product.sku || item.product.id.substring(0, 6)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-[11px] leading-none">{item.product.name}</span>
                            <span className="text-[7px] uppercase font-black text-white/20 mt-1">{item.product.category || "Geral"}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-[11px] font-bold text-white/70">{item.quantity}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] font-bold text-white/40">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] font-black text-primary italic">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice * item.quantity)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {budget.items.length === 0 && (
                <div className="p-12 text-center">
                  <Package className="size-8 text-white/5 mx-auto mb-2" />
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Nenhum item adicionado</p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleFileChange}
      />
    </div>
  );
}