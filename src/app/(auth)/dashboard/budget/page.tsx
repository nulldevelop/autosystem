
import { BudgetList } from "./_components/budget-list";
import { getBudgets } from "./_data-access/get-budgets";

export default async function BudgetPage() {
  const budgets = await getBudgets();

  return (
    <div className="p-6">
      <BudgetList budgets={budgets} />
    </div>
  );
}
