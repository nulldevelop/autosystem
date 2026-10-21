import {
  CardGridSkeleton,
  PageHeaderSkeleton,
  StatGridSkeleton,
  ToolbarSkeleton,
} from "@/components/app/skeletons";

export default function ProductLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton actions={2} />
      <StatGridSkeleton />
      <ToolbarSkeleton />
      <CardGridSkeleton />
    </div>
  );
}
