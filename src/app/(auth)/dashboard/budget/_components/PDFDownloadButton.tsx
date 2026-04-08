"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BudgetWithRelations } from "@/types/budget";
import { BudgetPDF } from "./BudgetPDF";

interface PDFDownloadButtonProps {
  budget: BudgetWithRelations;
}

export function PDFDownloadButton({ budget }: PDFDownloadButtonProps) {
  const [shouldRender, setShouldRender] = useState(false);

  if (!shouldRender) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShouldRender(true)}>
        Baixar PDF
        <FileDown className="w-4 h-4 ml-2" />
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<BudgetPDF budget={budget as any} />}
      fileName={`orcamento-${budget.id.substring(0, 6)}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <>
              Gerando...
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            </>
          ) : (
            <>
              Download
              <FileDown className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
