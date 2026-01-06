"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ServiceOrderPDF } from "./ServiceOrderPDF";
import { getBudgetDetails, type BudgetDetails } from "../_data-access/get-budget-details"; // Updated import path
import { createServiceOrder } from "../_actions/create-service-order"; // Updated import path
import { FileText } from "lucide-react";

interface PDFServiceOrderDownloadButtonProps {
  budgetId: string;
}

export function PDFServiceOrderDownloadButton({
  budgetId,
}: PDFServiceOrderDownloadButtonProps) {
  const [budget, setBudget] = useState<BudgetDetails | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [serviceOrderId, setServiceOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBudget() {
      setIsLoading(true);
      const budgetDetails = await getBudgetDetails(budgetId);
      setBudget(budgetDetails);
      setServiceOrderId(budgetDetails?.serviceOrder?.id || null);
      setIsLoading(false);
    }

    if (budgetId) {
      fetchBudget();
    }
  }, [budgetId]);

  const handleCreateServiceOrder = async () => {
    setIsCreating(true);
    try {
      const result = await createServiceOrder({ budgetId });
      if (result.success && result.serviceOrderId) {
        setServiceOrderId(result.serviceOrderId);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao criar a Ordem de Serviço.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading || !budget) {
    return <Button disabled>Carregando O.S....</Button>;
  }

  if (!serviceOrderId) {
    return (
      <Button onClick={handleCreateServiceOrder} disabled={isCreating}>
        {isCreating ? "Criando O.S...." : "Gerar O.S."}
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ServiceOrderPDF budget={budget} />}
      fileName={`ordem-de-servico-${budget.id.substring(0, 6)}.pdf`}
    >
      {({ loading }) => (
        <Button disabled={loading}>
          {loading ? "Gerando PDF..." : "Baixar O.S."}
          <FileText className="w-4 h-4 ml-2" />
        </Button>
      )}
    </PDFDownloadLink>
  );
}
