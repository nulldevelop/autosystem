"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { createServiceOrder } from "../_actions/create-service-order";
import {
  type BudgetDetails,
  getBudgetDetails,
} from "../_data-access/get-budget-details";
import { ServiceOrderPDF } from "./ServiceOrderPDF";

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
    } catch (_error) {
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isCreating}>
            {isCreating ? "Criando O.S...." : "Gerar O.S."}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ordem de Serviço</AlertDialogTitle>
            <AlertDialogDescription>
              Ao confirmar, o orçamento será automaticamente aprovado e uma nova
              Ordem de Serviço será criada. Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateServiceOrder}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
