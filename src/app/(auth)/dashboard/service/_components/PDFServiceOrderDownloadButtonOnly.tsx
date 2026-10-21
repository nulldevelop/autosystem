"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BudgetWithRelations } from "@/types/budget";
import { ServiceOrderPDF } from "../../budget/_components/ServiceOrderPDF";

interface PDFServiceOrderDownloadButtonOnlyProps {
  budget: BudgetWithRelations;
  className?: string;
}

export function PDFServiceOrderDownloadButtonOnly({
  budget,
  className,
}: PDFServiceOrderDownloadButtonOnlyProps) {
  const [shouldRender, setShouldRender] = useState(false);

  if (!shouldRender) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShouldRender(true)}
        className={cn(className)}
      >
        <Download />
        PDF
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ServiceOrderPDF budget={budget as any} />}
      fileName={`ordem-de-servico-${budget.id.substring(0, 6)}.pdf`}
      style={{ display: "inline-block" }}
    >
      {({ loading }) => (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          className={cn(className)}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <FileText />
              Baixar PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
