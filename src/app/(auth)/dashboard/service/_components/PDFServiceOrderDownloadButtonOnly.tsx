"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText, Loader2, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BudgetWithRelations } from "@/types/budget";
import { ServiceOrderPDF } from "../../budget/_components/ServiceOrderPDF";

interface PDFServiceOrderDownloadButtonOnlyProps {
  budget: BudgetWithRelations;
}

export function PDFServiceOrderDownloadButtonOnly({
  budget,
}: PDFServiceOrderDownloadButtonOnlyProps) {
  const [shouldRender, setShouldRender] = useState(false);

  if (!shouldRender) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShouldRender(true)}
        className="w-full h-9 gap-2 border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-wider"
      >
        Download O.S.
        <Download className="w-3.5 h-3.5" />
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ServiceOrderPDF budget={budget as any} />}
      fileName={`ordem-de-servico-${budget.id.substring(0, 6)}.pdf`}
      style={{ width: '100%' }}
    >
      {({ loading }) => (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={loading}
          className="w-full h-9 gap-2 border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-wider text-primary border-primary/20"
        >
          {loading ? (
            <>
              Gerando...
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </>
          ) : (
            <>
              Baixar PDF
              <FileText className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
