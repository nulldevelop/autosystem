"use client";

import { CreateProductForm } from "../product/_components/create-product-form";

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProductModal({
  open,
  onOpenChange,
}: CreateProductModalProps) {
  return <CreateProductForm open={open} onOpenChange={onOpenChange} />;
}
