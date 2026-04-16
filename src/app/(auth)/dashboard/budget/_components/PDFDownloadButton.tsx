"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BudgetWithRelations } from "@/types/budget";

interface PDFDownloadButtonProps {
  budget: BudgetWithRelations;
}

export function PDFDownloadButton({ budget }: PDFDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    // Redireciona para a API de download
    window.location.href = `/api/budget/${budget.id}/pdf`;

    // Pequeno delay para resetar o loading (já que o navegador vai tratar o download)
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isLoading}
      className="w-full h-9 gap-2 border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-wider"
    >
      {isLoading ? (
        <>
          Gerando...
          <Loader2 className="w-4 h-4 animate-spin" />
        </>
      ) : (
        <>
          Baixar PDF
          <FileDown className="w-4 h-4" />
        </>
      )}
    </Button>
  );
}
