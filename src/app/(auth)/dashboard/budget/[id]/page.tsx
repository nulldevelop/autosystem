import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBudgetDetails } from "../_data-access/get-budget-details";
import { BudgetDetailsClient } from "./budget-details-client";
import { Skeleton } from "@/components/ui/skeleton";

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
    <Suspense fallback={<BudgetSkeleton />}>
      <BudgetDetailsClient budget={budget} />
    </Suspense>
  );
}

function BudgetSkeleton() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-4 w-48 bg-white/5" />
        </div>
        <Skeleton className="h-12 w-40 bg-white/5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 bg-white/5 rounded-2xl" />
        <Skeleton className="h-32 bg-white/5 rounded-2xl" />
        <Skeleton className="h-32 bg-white/5 rounded-2xl" />
      </div>
      <Skeleton className="h-[400px] w-full bg-white/5 rounded-2xl" />
    </div>
  );
}
