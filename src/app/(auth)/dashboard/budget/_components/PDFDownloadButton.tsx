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
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <FileDown />}
      {isLoading ? "Gerando…" : "PDF"}
    </Button>
  );
}
