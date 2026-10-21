import {
  PageHeaderSkeleton,
  RowCardsSkeleton,
  StatGridSkeleton,
  ToolbarSkeleton,
} from "@/components/app/skeletons";

export default function ServiceLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton actions={0} />
      <StatGridSkeleton />
      <ToolbarSkeleton />
      <RowCardsSkeleton count={4} />
    </div>
  );
}
