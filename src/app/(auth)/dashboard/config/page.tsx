import { PageHeader } from "@/components/app/page-header";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { ConfigForm } from "./_components/config-form";

export default async function ConfigPage() {
  const session = await getSession();
  const activeOrgId = session?.session?.activeOrganizationId;

  const organization = activeOrgId
    ? await prisma.organization.findUnique({ where: { id: activeOrgId } })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados da oficina que aparecem em orçamentos e ordens de serviço."
      />
      <ConfigForm organization={organization} />
    </div>
  );
}
