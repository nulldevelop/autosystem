
import { ServiceOrderList } from "./_components/service-order-list";
import { getServiceOrders } from "./_data-access/get-service-orders";

export default async function ServiceOrderPage() {
  const serviceOrders = await getServiceOrders();

  return (
    <div className="p-6">
      <ServiceOrderList serviceOrders={serviceOrders} />
    </div>
  );
}
