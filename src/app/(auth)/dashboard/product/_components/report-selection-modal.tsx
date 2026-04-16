"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  AlertTriangle,
  ArrowDownToLine,
  FileText,
  Loader2,
  Package,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/generated/prisma/client";
import { InventoryReportPDF } from "./inventory-report-pdf";

interface ReportSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  organization: any;
}

export function ReportSelectionModal({
  open,
  onOpenChange,
  products,
  organization,
}: ReportSelectionModalProps) {
  const [_isGenerating, _setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: "general",
      title: "Relatório Geral de Inventário",
      description: "Lista completa de produtos, SKUs e valores totais.",
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      data: products,
    },
    {
      id: "low-stock",
      title: "Alerta de Baixo Estoque",
      description:
        "Somente itens que atingiram ou estão abaixo do estoque mínimo.",
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      data: products.filter((p) => p.stockQuantity <= p.minStock),
    },
    {
      id: "out-of-stock",
      title: "Produtos Esgotados",
      description: "Relatório focado em itens com saldo zero para reposição.",
      icon: FileText,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      data: products.filter((p) => p.stockQuantity === 0),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-950 border-white/5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Central de <span className="text-primary">Relatórios</span>
          </DialogTitle>
          <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
            Selecione o tipo de extração de dados desejada
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              className="group relative flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${report.bgColor}`}>
                  <report.icon className={`size-5 ${report.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                    {report.title}
                  </h4>
                  <p className="text-[10px] text-white/40 font-medium max-w-[240px]">
                    {report.description}
                  </p>
                </div>
              </div>

              {report.data.length > 0 ? (
                <PDFDownloadLink
                  document={
                    <InventoryReportPDF
                      products={report.data}
                      organization={organization}
                      title={report.title}
                    />
                  }
                  fileName={`${report.id}-${Date.now()}.pdf`}
                  className="flex items-center justify-center"
                >
                  {({ loading }) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading}
                      className="size-10 rounded-xl hover:bg-primary hover:text-black transition-all"
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowDownToLine className="size-5" />
                      )}
                    </Button>
                  )}
                </PDFDownloadLink>
              ) : (
                <div className="text-[9px] font-black uppercase text-white/20 px-2">
                  Sem dados
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-white/5">
          <p className="text-[9px] text-center text-white/20 font-black uppercase tracking-[0.2em]">
            Formato: PDF Paisagem (A4) • Dados em Tempo Real
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
