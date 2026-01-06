import { BackgroundAnimation } from "@/utils/backgroud";
import { CustomerList } from "./_components/customer-list";
import { getCustomers } from "./_data-access/get-customers";

export default async function CustomerPage() {
  const customers = await getCustomers();

  return (
    <div className="p-6">
      <BackgroundAnimation />
      <CustomerList customers={customers} />
    </div>
  );
}
