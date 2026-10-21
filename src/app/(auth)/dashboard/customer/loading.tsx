import {
  CardGridSkeleton,
  PageHeaderSkeleton,
  StatGridSkeleton,
  ToolbarSkeleton,
} from "@/components/app/skeletons";

export default function CustomerLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <ToolbarSkeleton tabs={false} />
      <CardGridSkeleton />
    </div>
  );
}
