import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { getSession } from "@/lib/getSession";
import { FinanceiroClient } from "./_components/financeiro-client";
import { getFinancialData } from "./_data-access/get-transactions";

export default async function FinanceiroPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return (
      <div>Você precisa estar logado para acessar os dados financeiros.</div>
    );
  }

  const [data, organization] = await Promise.all([
    getFinancialData(),
    getActiveOrganization(session.user.id),
  ]);

  if (!data) {
    return (
      <div>
        Erro ao carregar dados financeiros ou organização não selecionada.
      </div>
    );
  }

  return (
    <Suspense fallback={<FinanceiroSkeleton />}>
      <FinanceiroClient data={data as any} organization={organization} />
    </Suspense>
  );
}

function FinanceiroSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64 bg-white/5" />
        <div className="flex gap-2">
          <Skeleton className="h-12 w-40 bg-white/5" />
          <Skeleton className="h-12 w-40 bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-32 bg-white/5 rounded-2xl" />
        <Skeleton className="h-32 bg-white/5 rounded-2xl" />
        <Skeleton className="h-32 bg-white/5 rounded-2xl" />
        <Skeleton className="h-32 bg-white/5 rounded-2xl" />
      </div>
      <Skeleton className="h-[400px] w-full bg-white/5 rounded-2xl" />
    </div>
  );
}
