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
import { cn } from "@/lib/utils";
import { Send, FileText, ChevronRight } from "lucide-react";
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

interface BudgetListProps {
  budgets: BudgetWithRelations[];
}

export function BudgetList({ budgets }: BudgetListProps) {
  const [isCreateBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white font-poppins">
            Orçamentos <span className="text-primary">Digitais</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Acelere o fechamento com orçamentos em segundos
          </p>
        </div>
        <Button 
          onClick={() => setCreateBudgetModalOpen(true)} 
          className="glow-primary w-full sm:w-auto"
        >
          Novo Orçamento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <Card key={budget.id} className="relative group border-white/5 hover:border-primary/20 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                  ID: {budget.id.substring(0, 8)}
                </span>
                <Badge className={cn(
                  "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider border",
                  budget.status === 'aproved' ? "bg-primary/10 text-primary border-primary/20 glow-primary" : 
                  budget.status === 'pending' ? "bg-secondary/10 text-secondary border-secondary/20" : 
                  "bg-destructive/10 text-destructive border-destructive/20"
                )}>
                  {STATUS_LABEL[budget.status]}
                </Badge>
              </div>
              <CardTitle className="text-white text-xl">
                {budget.customer?.name || "Cliente não identificado"}
              </CardTitle>
              <CardDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest">
                {budget.vehicle?.model || "Veículo não cadastrado"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/20 uppercase">Valor Total</span>
                  <span className="text-lg font-black text-primary text-glow">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(budget.totalAmount)}
                  </span>
                </div>
                {budget.observacoes && (
                  <p className="text-xs text-white/40 italic line-clamp-1 border-t border-white/5 pt-2 mt-2">
                    "{budget.observacoes}"
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <PDFDownloadButton budget={budget} />
                  </div>
                  <div className="flex-1">
                    <PDFServiceOrderDownloadButton budget={budget} />
                  </div>
                </div>
                <Button variant="tech" className="w-full gap-2">
                  <Send className="size-3" />
                  Enviar via WhatsApp
                </Button>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
          </Card>
        ))}
      </div>

      {budgets.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-20 glass rounded-3xl border-2 border-dashed border-white/10">
          <div className="p-6 rounded-full bg-white/5 mb-6">
            <FileText className="size-12 text-white/10" />
          </div>
          <h3 className="text-xl font-black italic text-white mb-2 uppercase tracking-tighter">Nenhum Orçamento</h3>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-8 max-w-xs">
            Sua lista está vazia. Comece a acelerar sua oficina agora.
          </p>
          <Button onClick={() => setCreateBudgetModalOpen(true)} className="glow-primary">
            Gerar Primeiro Orçamento
          </Button>
        </div>
      )}

      <CreateBudgetForm
        open={isCreateBudgetModalOpen}
        onOpenChange={setCreateBudgetModalOpen}
      />
    </div>
  );
}
