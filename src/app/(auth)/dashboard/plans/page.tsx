import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentPlanInfo } from "./_components/current-plan-info";
import { getCurrentSubscription } from "./_data-access/get-current-subscription";
import { PlanCards } from "./plan-cars";

export default async function PlansPage() {
  const subscription = await getCurrentSubscription();

  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden p-4 md:p-6 flex flex-col">
      <div className="flex flex-col gap-2 md:gap-4 mb-4 md:mb-6 shrink-0">
        <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
          Planos de <span className="text-primary">Assinatura</span>
        </h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
          Evolua sua oficina com os melhores recursos técnicos
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pb-4">
        <Suspense
          fallback={
            <Skeleton className="h-32 md:h-48 w-full bg-white/5 rounded-2xl" />
          }
        >
          <CurrentPlanInfo subscription={subscription as any} />
        </Suspense>

        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white">
              Opções de <span className="text-primary">Upgrade</span>
            </h2>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">
              Selecione o plano ideal para seu volume de trabalho
            </p>
          </div>
          <PlanCards />
        </div>
      </div>
    </div>
  );
}
