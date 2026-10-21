import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Car, ClipboardCheck, User, Wrench } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { SignatureForm } from "./_components/signature-form";

export default async function BudgetSignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const budget = await prisma.budget.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      items: {
        include: {
          product: true,
        },
      },
      organization: true,
    },
  });

  if (!budget || !budget.customer || !budget.vehicle) {
    notFound();
  }

  if (budget.signature) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border bg-card text-center p-8">
          <div className="size-16 rounded-full bg-success/12 text-success flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Orçamento Assinado
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Este documento já foi validado em{" "}
            {format(budget.signedAt!, "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </p>
          <Badge className="bg-success/12 text-success border-success/25 px-4 py-1">
            STATUS: APROVADO
          </Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Aprovação de Orçamento
          </h1>
          <p className="text-sm text-muted-foreground">
            {budget.organization?.name || "AutoSystem"} • ID:{" "}
            {budget.id.substring(0, 8)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <User className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground">
                  Cliente
                </p>
                <p className="text-sm font-bold">{budget.customer.name}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-info/12 text-info">
                <Car className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground">
                  Veículo
                </p>
                <p className="text-sm font-bold">
                  {budget.vehicle.marca} {budget.vehicle.model}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-success/12 text-success">
                <Wrench className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground">Total</p>
                <p className="text-sm font-bold text-primary">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(budget.totalAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-primary">Itens do Orçamento</h3>
          <div className="rounded-3xl border border-border bg-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-card text-xs font-bold text-muted-foreground">
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Qtd</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {budget.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4 font-bold">{item.product.name}</td>
                    <td className="p-4 text-muted-foreground">
                      {item.quantity}
                    </td>
                    <td className="p-4 text-right font-bold text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SignatureForm budgetId={budget.id} />
      </div>
    </div>
  );
}
