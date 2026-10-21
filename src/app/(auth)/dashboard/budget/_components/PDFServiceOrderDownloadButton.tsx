"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText, Loader2, PlusCircle } from "lucide-react";
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
          <Button
            variant="outline"
            size="sm"
            disabled={isCreating}
            className="h-8 px-3 text-xs font-medium gap-1.5"
          >
            {isCreating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <PlusCircle className="size-3.5" />
                Gerar O.S.
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirmar Ordem de Serviço
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ao confirmar, o orçamento será automaticamente aprovado e uma nova
              Ordem de Serviço será criada. Esta ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateServiceOrder}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (!shouldRender) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShouldRender(true)}
        className="h-8 px-3 text-xs font-medium gap-1.5"
      >
        <FileText className="size-3.5" />
        O.S.
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      // biome-ignore lint/suspicious/noExplicitAny: type mismatch for ServiceOrderPDF budget
      document={<ServiceOrderPDF budget={initialBudget as any} />}
      fileName={`ordem-de-servico-${initialBudget.id.substring(0, 6)}.pdf`}
      style={{ display: "inline-block" }}
    >
      {({ loading }) => (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          className="h-8 px-3 text-xs font-medium gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <FileText className="size-3.5" />
              Baixar O.S.
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
