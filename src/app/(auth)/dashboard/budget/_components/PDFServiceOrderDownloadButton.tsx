"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText, Loader2 } from "lucide-react";
import { useState } from "react";
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
import type { BudgetWithRelations } from "@/types/budget";
import { createServiceOrder } from "../_actions/create-service-order";
import { ServiceOrderPDF } from "./ServiceOrderPDF";

interface PDFServiceOrderDownloadButtonProps {
  budget: BudgetWithRelations;
}

export function PDFServiceOrderDownloadButton({
  budget: initialBudget,
}: PDFServiceOrderDownloadButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [serviceOrderId, setServiceOrderId] = useState<string | null>(
    initialBudget.serviceOrder?.id || null,
  );
  const [shouldRender, setShouldRender] = useState(false);

  const handleCreateServiceOrder = async () => {
    setIsCreating(true);
    try {
      const result = await createServiceOrder({ budgetId: initialBudget.id });
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

  if (!serviceOrderId) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isCreating}>
            {isCreating ? (
              <>
                Criando...
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              </>
            ) : (
              "Gerar O.S."
            )}
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

  if (!shouldRender) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShouldRender(true)}>
        Baixar O.S.
        <FileText className="w-4 h-4 ml-2" />
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<ServiceOrderPDF budget={initialBudget as any} />}
      fileName={`ordem-de-servico-${initialBudget.id.substring(0, 6)}.pdf`}
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
              Download O.S.
              <FileText className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
