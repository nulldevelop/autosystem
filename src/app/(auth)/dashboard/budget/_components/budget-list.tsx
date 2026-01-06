"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Budget } from "@/generated/prisma/client";
import { CreateBudgetForm } from "./create-budget-form";

interface BudgetListProps {
  budgets: Budget[];
}

export function BudgetList({ budgets }: BudgetListProps) {
  const [isCreateBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus orçamentos aqui. Adicione, edite ou remova
            orçamentos.
          </p>
        </div>
        <Button onClick={() => setCreateBudgetModalOpen(true)}>
          Adicionar Orçamento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <Card key={budget.id}>
            <CardHeader>
              <CardTitle>Orçamento #{budget.id.substring(0, 6)}</CardTitle>
              <CardDescription>
                Status: {budget.status}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Valor Total:</span>{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(budget.totalAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Cliente ID:</span>{" "}
                {budget.customerId}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Veículo ID:</span>{" "}
                {budget.vehicleId}
              </p>
               <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Observações:</span>{" "}
                {budget.observacoes || "N/A"}
              </p>
            </CardContent>
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
