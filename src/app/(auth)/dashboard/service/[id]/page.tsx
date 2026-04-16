import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getServiceOrderDetails } from "../_data-access/get-service-order-details";
import { ServiceOrderDetailsClient } from "./service-order-details-client";

interface ServiceOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceOrderPage({
  params,
}: ServiceOrderPageProps) {
  const { id } = await params;
  const serviceOrder = await getServiceOrderDetails(id);

  if (!serviceOrder) {
    notFound();
  }

  return (
    <Suspense fallback={<ServiceOrderSkeleton />}>
      <ServiceOrderDetailsClient serviceOrder={serviceOrder as any} />
    </Suspense>
  );
}

function ServiceOrderSkeleton() {
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
