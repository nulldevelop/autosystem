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
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-black italic tracking-tighter">
          Configurações da Oficina
        </h1>
        <p className="text-muted-foreground">
          Gerencie as informações da sua empresa
        </p>
      </div>
      <ConfigForm organization={organization} />
    </div>
  );
}
