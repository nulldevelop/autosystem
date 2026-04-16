"use client";

import { useEffect, useState } from "react";
import { CreateVehicleForm } from "../vehicle/_components/create-vehicle-form";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface CreateVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateVehicleModal({
  open,
  onOpenChange,
}: CreateVehicleModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data - in a real app, this would come from an API call
        const mockCustomers: Customer[] = [
          {
            id: "1",
            name: "João Silva",
            email: "joao@email.com",
            phone: "11999999999",
          },
          {
            id: "2",
            name: "Maria Oliveira",
            email: "maria@email.com",
            phone: "11888888888",
          },
          {
            id: "3",
            name: "Carlos Souza",
            email: "carlos@email.com",
            phone: "11777777777",
          },
        ];

        setCustomers(mockCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      // Simulate fetching customers - in a real app, you would call an API
      loadCustomers();
    } else {
      setCustomers([]);
    }
  }, [open]);

  if (loading) {
    return (
      <CreateVehicleForm
        open={open}
        onOpenChange={onOpenChange}
        customers={[]}
      />
    );
  }

  return (
    <CreateVehicleForm
      open={open}
      onOpenChange={onOpenChange}
      customers={customers}
    />
  );
}
