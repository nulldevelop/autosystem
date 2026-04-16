import { checkPermission } from "@/utils/permissions/check-permission";
import { getCustomers } from "../customer/_data-access/get-customers";
import { VehicleList } from "./_components/vehicle-list";
import { getVehicles } from "./_data-access/get-vehicles";

export default async function VehiclePage() {
  await checkPermission("/dashboard/vehicle");
  const vehicles = await getVehicles();
  const customers = await getCustomers();

  return (
    <div className="p-6">
      <VehicleList vehicles={vehicles} customers={customers} />
    </div>
  );
}
