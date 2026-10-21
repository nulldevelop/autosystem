"use client";

import { Calendar, Car, MoreVertical, Plus, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Plate } from "@/components/app/plate";
import { SearchInput } from "@/components/app/toolbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Customer, Vehicle } from "@/generated/prisma/client";
import { deleteVehicle } from "../_actions/delete-vehicle";
import { CreateVehicleForm } from "./create-vehicle-form";
import { VehicleStats } from "./vehicle-stats";

type VehicleWithCustomer = Vehicle & {
  customer: Customer | null;
};

interface VehicleListProps {
  vehicles: VehicleWithCustomer[];
  customers: Customer[];
}

export function VehicleList({ vehicles, customers }: VehicleListProps) {
  const [isCreateVehicleModalOpen, setCreateVehicleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleToDelete, setVehicleToDelete] =
    useState<VehicleWithCustomer | null>(null);

  const filteredVehicles = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return vehicles.filter(
      (vehicle) =>
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.marca.toLowerCase().includes(search) ||
        vehicle.licensePlate.toLowerCase().includes(search) ||
        vehicle.customer?.name.toLowerCase().includes(search),
    );
  }, [vehicles, searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteVehicle(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (_error) {
      toast.error("Não foi possível remover o veículo.");
    } finally {
      setVehicleToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veículos"
        description="Placas, modelos e proprietários dos carros atendidos."
        actions={
          <Button onClick={() => setCreateVehicleModalOpen(true)}>
            <Plus /> Novo veículo
          </Button>
        }
      />

      <VehicleStats vehicles={vehicles} />

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por placa, modelo, marca ou proprietário"
      />

      {filteredVehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Nenhum veículo encontrado"
          description={
            searchTerm
              ? "Tente buscar com outra placa, modelo ou proprietário."
              : "Cadastre o primeiro veículo para usá-lo nos orçamentos."
          }
          action={
            !searchTerm ? (
              <Button onClick={() => setCreateVehicleModalOpen(true)}>
                <Plus /> Novo veículo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start justify-between gap-3">
                <Plate value={vehicle.licensePlate} className="text-base" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Ações para ${vehicle.licensePlate}`}
                      className="-mt-1 -mr-2 text-muted-foreground"
                    >
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 py-2.5 text-destructive focus:text-destructive"
                      onClick={() => setVehicleToDelete(vehicle)}
                    >
                      <Trash2 className="size-4" /> Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="mt-3 truncate text-lg font-semibold">
                {vehicle.marca} {vehicle.model}
              </h3>

              <dl className="mt-3 space-y-1.5 border-t pt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 shrink-0" aria-hidden />
                  <dd className="num">Ano {vehicle.year}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <User className="size-4 shrink-0" aria-hidden />
                  <dd className="truncate">
                    {vehicle.customer?.name ?? "Sem proprietário"}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <AlertDialog
        open={!!vehicleToDelete}
        onOpenChange={(open) => !open && setVehicleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              {vehicleToDelete?.marca} {vehicleToDelete?.model} (
              {vehicleToDelete?.licensePlate}) será removido de forma
              permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                vehicleToDelete && handleDelete(vehicleToDelete.id)
              }
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateVehicleForm
        open={isCreateVehicleModalOpen}
        onOpenChange={setCreateVehicleModalOpen}
        customers={customers}
      />
    </div>
  );
}
