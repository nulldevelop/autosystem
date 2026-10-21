import {
  CardGridSkeleton,
  PageHeaderSkeleton,
  StatGridSkeleton,
  ToolbarSkeleton,
} from "@/components/app/skeletons";

export default function VehicleLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatGridSkeleton />
      <ToolbarSkeleton tabs={false} />
      <CardGridSkeleton />
    </div>
  );
}
