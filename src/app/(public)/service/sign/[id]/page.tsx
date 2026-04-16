import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Car, ClipboardCheck, FileText, User } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { SignatureForm } from "./_components/signature-form";

export default async function ServiceOrderSignPage({
  params,
}: {
  params: { id: string };
}) {
  const serviceOrder = await prisma.serviceOrder.findUnique({
    where: { id: (await params).id },
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

  if (!serviceOrder) {
    notFound();
  }

  // Use a type cast since we just added these fields to the schema
  const signedAt = (serviceOrder as any).signedAt;
  const signature = (serviceOrder as any).signature;

  if (signature) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-white/5 bg-white/[0.02] text-center p-8">
          <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck className="size-8" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
            O.S. <span className="text-emerald-500">Assinada</span>
          </h1>
          <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-6">
            Esta Ordem de Serviço foi validada em{" "}
            {format(new Date(signedAt), "dd/MM/yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </p>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1">
            STATUS: EM EXECUÇÃO
          </Badge>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Assinatura de{" "}
            <span className="text-emerald-500">Ordem de Serviço</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
            {serviceOrder.organization?.name} • O.S. #
            {serviceOrder.id.substring(0, 8)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-white/5 bg-white/[0.02]">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <User className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40">
                  Cliente
                </p>
                <p className="text-sm font-bold">
                  {serviceOrder.customer.name}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-white/[0.02]">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Car className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40">
                  Veículo
                </p>
                <p className="text-sm font-bold">
                  {serviceOrder.vehicle.marca} {serviceOrder.vehicle.model}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-white/[0.02]">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-500">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white/40">
                  Total OS
                </p>
                <p className="text-sm font-bold text-emerald-500">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(serviceOrder.totalAmount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
            Serviços Autorizados
          </h3>
          <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <th className="p-4">Item/Serviço</th>
                  <th className="p-4">Qtd</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {serviceOrder.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4 font-bold">{item.product.name}</td>
                    <td className="p-4 text-white/40">{item.quantity}</td>
                    <td className="p-4 text-right font-black text-emerald-500">
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

        <SignatureForm serviceOrderId={serviceOrder.id} />
      </div>
    </div>
  );
}
