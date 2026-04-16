"use client";

import { CreateCustomerForm } from "../customer/_components/create-customer-form";

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCustomerModal({
  open,
  onOpenChange,
}: CreateCustomerModalProps) {
  return <CreateCustomerForm open={open} onOpenChange={onOpenChange} />;
}
