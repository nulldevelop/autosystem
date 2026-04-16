import { checkPermission } from "@/utils/permissions/check-permission";
import { ServiceOrderList } from "./_components/service-order-list";
import { getServiceOrders } from "./_data-access/get-service-orders";

export default async function ServiceOrderPage() {
  await checkPermission("/dashboard/service");
  const serviceOrders = await getServiceOrders();

  return (
    <div className="p-6">
      <ServiceOrderList serviceOrders={serviceOrders} />
    </div>
  );
}
