"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  RefreshCcw,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CurrentPlanInfoProps {
  subscription: any;
}

export function CurrentPlanInfo({ subscription }: CurrentPlanInfoProps) {
  if (!subscription) return null;

  const isTrial = subscription.status === "trialing" || !subscription.stripeSubscriptionId;
  const nextPayment = subscription.stripeCurrentPeriodEnd ? new Date(subscription.stripeCurrentPeriodEnd) : null;
  const amount = subscription.planDetails?.price.monthly || 0;

  return (
    <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm overflow-hidden relative group transition-all duration-500 hover:border-primary/40 mb-8">
      {/* Background Decorative */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Zap className="size-40 -rotate-12" />
      </div>

      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sua Assinatura Ativa</span>
                  <Badge className="bg-primary text-black font-black uppercase text-[9px] h-4 px-1.5 border-0">
                    {subscription.status === 'active' ? 'Ativo' : 'Teste'}
                  </Badge>
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                  Plano <span className="text-primary">{subscription.planDetails?.name || subscription.plan}</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/30 uppercase text-[9px] font-black tracking-widest">
                  <Calendar className="size-3" /> Próximo Vencimento
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-tighter italic">
                  {nextPayment ? format(nextPayment, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/30 uppercase text-[9px] font-black tracking-widest">
                  <CreditCard className="size-3" /> Valor da Recorrência
                </div>
                <p className="text-sm font-bold text-white italic tracking-tighter">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
                  <span className="text-[10px] text-white/30 font-black ml-1">/ MÊS</span>
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/30 uppercase text-[9px] font-black tracking-widest">
                  <RefreshCcw className="size-3" /> Método de Pagamento
                </div>
                <p className="text-sm font-bold text-white uppercase italic tracking-tighter">
                  Stripe Secure Checkout
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn">
              Gerenciar Assinatura <ArrowRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
