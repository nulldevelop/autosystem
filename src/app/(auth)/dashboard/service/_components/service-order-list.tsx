"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { ServiceOrder, ServiceOrderStatus } from "@/generated/prisma/client";
import { updateServiceOrderStatus } from "../_actions/update-service-order-status";

const STATUS_LABEL: Record<ServiceOrderStatus, string> = {
  open: "Aberta",
  in_progress: "Em Progresso",
  completed: "Concluída",
  canceled: "Cancelada",
};

const STATUS_VARIANT: Record<
  ServiceOrderStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  open: "secondary",
  in_progress: "default",
  completed: "default",
  canceled: "destructive",
};

interface ServiceOrderListProps {
  serviceOrders: (ServiceOrder & { customer: { name: string }; vehicle: { model: string } })[];
}

export function ServiceOrderList({ serviceOrders }: ServiceOrderListProps) {
  const handleFinalizeServiceOrder = async (serviceOrderId: string) => {
    const result = await updateServiceOrderStatus({
      serviceOrderId,
      status: "completed",
    });

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground">
            Acompanhe suas ordens de serviço aqui.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {serviceOrders.map((serviceOrder) => (
          <Card key={serviceOrder.id}>
            <CardHeader>
              <CardTitle>O.S. #{serviceOrder.id.substring(0, 6)}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <p>Status:</p>
                <Badge variant={STATUS_VARIANT[serviceOrder.status]}>
                  {STATUS_LABEL[serviceOrder.status]}
                </Badge>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Valor Total:</span>{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(serviceOrder.totalAmount)}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Cliente:</span>{" "}
                {serviceOrder.customer?.name ?? "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Veículo:</span>{" "}
                {serviceOrder.vehicle?.model ?? "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Observações:</span>{" "}
                {serviceOrder.observacoes || "N/A"}
              </p>
            </CardContent>
            <div className="p-4 pt-0">
              {serviceOrder.status !== "completed" &&
                serviceOrder.status !== "canceled" && (
                  <Button
                    onClick={() => handleFinalizeServiceOrder(serviceOrder.id)}
                    className="w-full"
                  >
                    Finalizar O.S.
                  </Button>
                )}
            </div>
          </Card>
        ))}
      </div>

      {serviceOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-lg font-medium">Nenhuma ordem de serviço encontrada.</p>
        </div>
      )}
    </>
  );
}
