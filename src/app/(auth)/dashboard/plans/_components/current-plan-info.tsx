"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  RefreshCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CurrentPlanInfoProps {
  subscription: any;
}

export function CurrentPlanInfo({ subscription }: CurrentPlanInfoProps) {
  if (!subscription) return null;

  const _isTrial =
    subscription.status === "trialing" || !subscription.stripeSubscriptionId;
  const nextPayment = subscription.stripeCurrentPeriodEnd
    ? new Date(subscription.stripeCurrentPeriodEnd)
    : null;
  const amount = subscription.planDetails?.price.monthly || 0;

  return (
    <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden relative group transition-all duration-500 hover:border-primary/40 mb-6 !w-full !mx-0">
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 p-4 md:p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Zap className="size-24 md:size-40 -rotate-12" />
      </div>

      <CardContent className="p-5 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-6 w-full">
            <div className="flex items-center gap-3">
              <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10 shrink-0">
                <ShieldCheck className="size-5 md:size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    Sua Assinatura Ativa
                  </span>
                  <Badge className="bg-primary text-black font-black uppercase text-[8px] h-3.5 px-1 border-0">
                    {subscription.status === "active" ? "Ativo" : "Teste"}
                  </Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                  Plano{" "}
                  <span className="text-primary">
                    {subscription.planDetails?.name || subscription.plan}
                  </span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 border-t border-white/5 pt-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] font-black tracking-widest leading-none">
                  <Calendar className="size-2.5" /> Próximo Vencimento
                </div>
                <p className="text-xs md:text-sm font-bold text-white uppercase tracking-tighter italic">
                  {nextPayment
                    ? format(nextPayment, "dd 'de' MMMM, yyyy", {
                        locale: ptBR,
                      })
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] font-black tracking-widest leading-none">
                  <CreditCard className="size-2.5" /> Valor Recorrência
                </div>
                <p className="text-xs md:text-sm font-bold text-white italic tracking-tighter">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(amount)}
                  <span className="text-[9px] text-white/30 font-black ml-1 uppercase">
                    / MÊS
                  </span>
                </p>
              </div>

              <div className="space-y-0.5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-white/30 uppercase text-[8px] font-black tracking-widest leading-none">
                  <RefreshCcw className="size-2.5" /> Pagamento
                </div>
                <p className="text-xs md:text-sm font-bold text-white uppercase italic tracking-tighter">
                  Checkout Seguro via Stripe
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto pt-2">
            <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-11 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn whitespace-nowrap">
              Gerenciar Assinatura{" "}
              <ArrowRight className="size-2.5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
