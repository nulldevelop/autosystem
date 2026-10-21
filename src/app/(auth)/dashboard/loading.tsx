import {
  DividedListSkeleton,
  PageHeaderSkeleton,
  StatGridSkeleton,
} from "@/components/app/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Skeleton className="h-6 w-44" />
          <DividedListSkeleton count={3} />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
