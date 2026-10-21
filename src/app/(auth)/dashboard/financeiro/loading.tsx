import {
  DividedListSkeleton,
  PageHeaderSkeleton,
  StatGridSkeleton,
} from "@/components/app/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export function FinanceiroSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton actions={2} />
      <StatGridSkeleton />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full rounded-lg sm:w-72" />
        <Skeleton className="h-5 w-64" />
      </div>
      <DividedListSkeleton count={6} />
    </div>
  );
}

export default function FinanceiroLoading() {
  return <FinanceiroSkeleton />;
}
