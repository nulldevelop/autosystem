import { checkPermission } from "@/utils/permissions/check-permission";
import { CustomerList } from "./_components/customer-list";
import { getCustomers } from "./_data-access/get-customers";

export default async function CustomerPage() {
  await checkPermission("/dashboard/customer");
  const customers = await getCustomers();

  return (
    <div className="p-6">
      <CustomerList customers={customers} />
    </div>
  );
}
