import { checkPermission } from "@/utils/permissions/check-permission";
import { BudgetList } from "./_components/budget-list";
import { getBudgets } from "./_data-access/get-budgets";

export default async function BudgetPage() {
  await checkPermission("/dashboard/budget");
  const budgets = await getBudgets();

  return (
    <div className="p-6">
      <BudgetList budgets={budgets} />
    </div>
  );
}
