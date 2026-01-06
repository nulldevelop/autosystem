"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Customer, Vehicle } from "@/generated/prisma/client";
import { CreateVehicleForm } from "./create-vehicle-form";

// The vehicle type from getVehicles will include the customer
type VehicleWithCustomer = Vehicle & {
  customer: Customer | null;
};

interface VehicleListProps {
  vehicles: VehicleWithCustomer[];
  customers: Customer[];
}

export function VehicleList({ vehicles, customers }: VehicleListProps) {
  const [isCreateVehicleModalOpen, setCreateVehicleModalOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Veículos</h1>
          <p className="text-muted-foreground">
            Gerencie sua frota de veículos aqui.
          </p>
        </div>
        <Button onClick={() => setCreateVehicleModalOpen(true)}>
          Adicionar Veículo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader>
              <CardTitle>
                {vehicle.marca} | {vehicle.model}
              </CardTitle>
              <CardDescription>
                Placa: {vehicle.licensePlate} - Ano: {vehicle.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Proprietário:</span>{" "}
                {vehicle.customer?.name || "N/A"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-lg font-medium">Nenhum veículo encontrado.</p>
          <p className="text-muted-foreground mb-4">
            Comece adicionando um novo veículo.
          </p>
          <Button onClick={() => setCreateVehicleModalOpen(true)}>
            Adicionar Veículo
          </Button>
        </div>
      )}

      <CreateVehicleForm
        open={isCreateVehicleModalOpen}
        onOpenChange={setCreateVehicleModalOpen}
        customers={customers}
      />
    </>
  );
}
