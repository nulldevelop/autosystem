import { Suspense } from "react";
import { getActiveOrganization } from "@/lib/getActiveOrganization";
import { getSession } from "@/lib/getSession";
import { checkPermission } from "@/utils/permissions/check-permission";
import { FinanceiroSkeleton } from "./loading";
import { FinanceiroClient } from "./_components/financeiro-client";
import { getFinancialData } from "./_data-access/get-transactions";

export default async function FinanceiroPage() {
  await checkPermission("/dashboard/financeiro");
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
