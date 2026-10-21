import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentPlanInfo } from "./_components/current-plan-info";
import { getCurrentSubscription } from "./_data-access/get-current-subscription";
import { PlanCards } from "./plan-cars";

export default async function PlansPage() {
  const subscription = await getCurrentSubscription();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Planos"
        description="Veja seu plano atual e troque quando precisar de mais capacidade."
      />

      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        {/* biome-ignore lint/suspicious/noExplicitAny: formato da assinatura vem do Stripe/Prisma */}
        <CurrentPlanInfo subscription={subscription as any} />
      </Suspense>

      <section className="space-y-4" aria-labelledby="plans-title">
        <div>
          <h2 id="plans-title" className="text-lg font-semibold">
            Escolha um plano
          </h2>
          <p className="text-sm text-muted-foreground">
            No plano anual você paga 10 meses e usa 12.
          </p>
        </div>
        <PlanCards />
      </section>
    </div>
  );
}
