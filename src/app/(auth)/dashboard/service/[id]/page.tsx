import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailSkeleton } from "@/components/app/skeletons";
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
    <Suspense fallback={<DetailSkeleton />}>
      <ServiceOrderDetailsClient serviceOrder={serviceOrder as any} />
    </Suspense>
  );
}
