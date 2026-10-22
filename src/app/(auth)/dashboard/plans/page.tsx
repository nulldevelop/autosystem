import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/getSession";
import { getOrCreateReferralCode, getReferralStats } from "@/lib/referral";
import { CurrentPlanInfo } from "./_components/current-plan-info";
import { getCurrentSubscription } from "./_data-access/get-current-subscription";
import { PlanCards } from "./plan-cars";
import { ReferralCard } from "./_components/referral-card";

export default async function PlansPage() {
  const subscription = await getCurrentSubscription();
  const session = await getSession();
  const [referralCode, referralStats] = session?.user
    ? await Promise.all([
        getOrCreateReferralCode(session.user.id),
        getReferralStats(session.user.id),
      ])
    : [null, null];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Planos"
        description="Veja seu plano atual e troque quando precisar de mais capacidade."
      />

      <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
        {/* biome-ignore lint/suspicious/noExplicitAny: formato da assinatura vem do Prisma */}
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

      {referralCode && referralStats && (
        <ReferralCard code={referralCode} stats={referralStats} />
      )}
    </div>
  );
}
