import { getVehicles } from "./_data-access/get-vehicles";
import { VehicleList } from "./_components/vehicle-list";
import { getCustomers } from "../customer/_data-access/get-customers";

export default async function VehiclePage() {
  const vehicles = await getVehicles();
  const customers = await getCustomers();

  return (
    <div className="p-6">
      <VehicleList vehicles={vehicles} customers={customers} />
    </div>
  );
}
