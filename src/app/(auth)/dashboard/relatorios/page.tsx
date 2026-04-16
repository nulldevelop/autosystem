import { endOfMonth, isValid, parseISO, startOfMonth } from "date-fns";
import { Suspense } from "react";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { RelatoriosClient } from "./_components/relatorios-client";
import { getReportData } from "./_data-access/get-report-data";
import Loading from "./loading";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const from = params.from ? parseISO(params.from) : startOfMonth(new Date());
  const to = params.to ? parseISO(params.to) : endOfMonth(new Date());

  // Basic validation
  const startDate = isValid(from) ? from : startOfMonth(new Date());
  const endDate = isValid(to) ? to : endOfMonth(new Date());

  const [data, session] = await Promise.all([
    getReportData(startDate, endDate),
    getSession(),
  ]);

  const organization = session?.session.activeOrganizationId
    ? await prisma.organization.findUnique({
        where: { id: session.session.activeOrganizationId },
      })
    : null;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-white/40 uppercase font-black italic">
        Organização não encontrada
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <RelatoriosClient data={data} organization={organization} />
    </Suspense>
  );
}
