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
import type { Customer } from "@/generated/prisma/client";
import { CreateCustomerForm } from "./create-customer-form";

interface CustomerListProps {
  customers: Customer[];
}

export function CustomerList({ customers }: CustomerListProps) {
  const [isCreateCustomerModalOpen, setCreateCustomerModalOpen] =
    useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes aqui. Adicione, edite ou remova clientes.
          </p>
        </div>
        <Button onClick={() => setCreateCustomerModalOpen(true)}>
          Adicionar Cliente
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle>{customer.name}</CardTitle>
              <CardDescription>{customer.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Endereço:</span>{" "}
                {customer.address || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Telefone:</span>{" "}
                {customer.phone || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">{customer.documentType}:</span>{" "}
                {customer.document}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {customers.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-lg font-medium">Nenhum cliente encontrado.</p>
          <p className="text-muted-foreground mb-4">
            Comece adicionando um novo cliente.
          </p>
          <Button onClick={() => setCreateCustomerModalOpen(true)}>
            Adicionar Cliente
          </Button>
        </div>
      )}

      <CreateCustomerForm
        open={isCreateCustomerModalOpen}
        onOpenChange={setCreateCustomerModalOpen}
      />
    </>
  );
}
