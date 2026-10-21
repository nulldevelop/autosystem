import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/app/skeletons";
import { getBudgetDetails } from "../_data-access/get-budget-details";
import { BudgetDetailsClient } from "./budget-details-client";

interface BudgetPageProps {
  params: Promise<{ id: string }>;
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const { id } = await params;
  const budget = await getBudgetDetails(id);

  if (!budget) {
    notFound();
  }

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <BudgetDetailsClient budget={budget} />
    </Suspense>
  );
}
