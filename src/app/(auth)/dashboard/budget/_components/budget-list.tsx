"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Status } from "@/generated/prisma/client";
import type { BudgetWithRelations } from "@/types/budget";
import { CreateBudgetForm } from "./create-budget-form";
import { PDFDownloadButton } from "./PDFDownloadButton";
import { PDFServiceOrderDownloadButton } from "./PDFServiceOrderDownloadButton";

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pendente",
  aproved: "Aprovado",
  rejected: "Rejeitado",
};

const STATUS_VARIANT: Record<
  Status,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  aproved: "default",
  rejected: "destructive",
};

interface BudgetListProps {
  budgets: BudgetWithRelations[];
}

export function BudgetList({ budgets }: BudgetListProps) {
  const [isCreateBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus orçamentos aqui. Adicione, edite ou remova orçamentos.
          </p>
        </div>
        <Button onClick={() => setCreateBudgetModalOpen(true)}>
          Adicionar Orçamento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <Card key={budget.id} className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Orçamento #{budget.id.substring(0, 6)}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <p>Status:</p>
                <Badge variant={STATUS_VARIANT[budget.status]}>
                  {STATUS_LABEL[budget.status]}
                </Badge>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 grow">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Valor Total:</span>{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(budget.totalAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Cliente:</span>{" "}
                {budget.customer?.name ?? "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Veículo:</span>{" "}
                {budget.vehicle?.model ?? "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Observações:</span>{" "}
                {budget.observacoes || "N/A"}
              </p>

              {budget.items && budget.items.length > 0 && (
                <div className="pt-2">
                  <h3 className="font-semibold text-sm">Itens:</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {budget.items.map((item) => (
                      <li key={item.id}>
                        {item.product?.name} ({item.quantity} x{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.unitPrice)}
                        )
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <div className="mt-4 flex gap-2 p-4 pt-0">
              <PDFDownloadButton budget={budget} />
              <PDFServiceOrderDownloadButton budget={budget} />
            </div>
          </Card>
        ))}
      </div>

      {budgets.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-lg font-medium">Nenhum orçamento encontrado.</p>
          <p className="text-muted-foreground mb-4">
            Comece adicionando um novo orçamento.
          </p>
          <Button onClick={() => setCreateBudgetModalOpen(true)}>
            Adicionar Orçamento
          </Button>
        </div>
      )}

      <CreateBudgetForm
        open={isCreateBudgetModalOpen}
        onOpenChange={setCreateBudgetModalOpen}
      />
    </>
  );
}
