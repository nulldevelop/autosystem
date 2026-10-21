import {
  PageHeaderSkeleton,
  RowCardsSkeleton,
  StatGridSkeleton,
  ToolbarSkeleton,
} from "@/components/app/skeletons";

export default function BudgetLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <ToolbarSkeleton />
      <RowCardsSkeleton count={4} />
    </div>
  );
}
