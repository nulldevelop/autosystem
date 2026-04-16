"use client";

import { CreateBudgetForm } from "../budget/_components/create-budget-form";

interface CreateBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBudgetModal({
  open,
  onOpenChange,
}: CreateBudgetModalProps) {
  return <CreateBudgetForm open={open} onOpenChange={onOpenChange} />;
}
