"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type BudgetDetails,
  getBudgetDetails,
} from "../_data-access/get-budget-details"; // Updated import path
import { BudgetPDF } from "./BudgetPDF";

interface PDFDownloadButtonProps {
  budgetId: string;
}

export function PDFDownloadButton({ budgetId }: PDFDownloadButtonProps) {
  const [budget, setBudget] = useState<BudgetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBudget() {
      setIsLoading(true);
      const budgetDetails = await getBudgetDetails(budgetId);
      setBudget(budgetDetails);
      setIsLoading(false);
    }

    if (budgetId) {
      fetchBudget();
    }
  }, [budgetId]);

  if (isLoading || !budget) {
    return <Button disabled>Carregando PDF...</Button>;
  }

  return (
    <PDFDownloadLink
      document={<BudgetPDF budget={budget} />}
      fileName={`orcamento-${budget.id.substring(0, 6)}.pdf`}
    >
      {({ loading }) => (
        <Button disabled={loading}>
          {loading ? "Gerando PDF..." : "Baixar PDF"}
          <FileDown className="w-4 h-4 ml-2" />
        </Button>
      )}
    </PDFDownloadLink>
  );
}
