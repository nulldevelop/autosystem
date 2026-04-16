"use client";

import {
  Calendar,
  Car,
  Info,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Customer, Vehicle } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const search = searchTerm.toLowerCase();
      return (
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.marca.toLowerCase().includes(search) ||
        vehicle.licensePlate.toLowerCase().includes(search) ||
        vehicle.customer?.name.toLowerCase().includes(search)
      );
    });
  }, [vehicles, searchTerm]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteVehicle(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao tentar remover veículo.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 lg:gap-6 lg:h-[calc(100svh-100px)] lg:overflow-hidden">
      <div className="flex flex-col gap-5 lg:gap-6 shrink-0 px-3 lg:px-1">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white">
              Frota de <span className="text-primary">Veículos</span>
            </h1>
            <p className="text-white/40 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              Gestão técnica e histórico automotivo
            </p>
          </div>
          <Button
            onClick={() => setCreateVehicleModalOpen(true)}
            className="glow-primary h-11 sm:h-12 px-4 sm:px-8 font-black uppercase italic tracking-tighter text-sm sm:text-md w-full sm:w-auto"
          >
            <Plus className="size-4 sm:size-5 mr-2" />
            Novo Veículo
          </Button>
        </div>

        <VehicleStats vehicles={vehicles} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/20" />
          <Input
            placeholder="Buscar veículo..."
            className="pl-10 bg-white/[0.02] border-white/10 text-sm focus:border-primary/50 h-11 lg:h-12 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-20 overflow-y-auto lg:pb-10 lg:pr-4">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((vehicle) => {
            const isDeletingCurrent = isDeleting === vehicle.id;

            return (
              <Card
                key={vehicle.id}
                className="group border-white/5 bg-zinc-950/40 hover:bg-white/[0.02] transition-all duration-300 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4 lg:hidden">
                    <div className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 shrink-0">
                      <Car className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge
                          variant="outline"
                          className="bg-primary/5 border-primary/20 text-primary text-[8px] font-black h-5 px-1 uppercase tracking-tighter"
                        >
                          {vehicle.licensePlate}
                        </Badge>
                      </div>
                      <h3 className="text-base font-black text-white uppercase tracking-tighter truncate group-hover:text-primary transition-colors">
                        {vehicle.marca} {vehicle.model}
                      </h3>
                      <div className="flex items-center gap-2 text-white/40 mt-0.5">
                        <Calendar className="size-3" />
                        <span className="text-[10px] font-bold">
                          {vehicle.year}
                        </span>
                        {vehicle.customer && (
                          <>
                            <span className="text-white/20">•</span>
                            <User className="size-3" />
                            <span className="text-[10px] font-bold truncate">
                              {vehicle.customer.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 shrink-0 text-white/40 hover:text-white hover:bg-white/10"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-zinc-950 border-white/10"
                      >
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                          <Info className="size-4 mr-2" />
                          Ver Histórico
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                          <Pencil className="size-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                              <Trash2 className="size-4 mr-2" />
                              {isDeletingCurrent ? "Removendo..." : "Remover"}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-black uppercase italic tracking-tighter text-xl">
                                Remover Veículo?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-white/60">
                                Esta ação removerá o veículo permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(vehicle.id)}
                                className="bg-red-600 text-white hover:bg-red-700 font-bold"
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="hidden lg:flex lg:flex-col xl:flex-row xl:items-center">
                    <div className="flex-1 p-5 border-b xl:border-b-0 xl:border-r border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-500">
                          <Car className="size-6" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="bg-primary/5 border-primary/20 text-primary text-[10px] font-black h-5 px-1.5 uppercase tracking-tighter"
                            >
                              {vehicle.licensePlate}
                            </Badge>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                              ID: {vehicle.id.substring(0, 8)}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                            {vehicle.marca} {vehicle.model}
                          </h3>
                          <div className="flex items-center gap-2 text-white/40">
                            <Calendar className="size-3 text-white/20" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">
                              Ano {vehicle.year}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4 xl:py-0 xl:w-[300px] border-b xl:border-b-0 xl:border-r border-white/5 space-y-1.5">
                      <div className="flex items-center gap-2 text-white/20 uppercase tracking-widest text-[9px] font-black">
                        <User className="size-3" /> Proprietário
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white/80 line-clamp-1">
                          {vehicle.customer?.name || "N/A"}
                        </span>
                        <span className="text-[10px] font-medium text-white/30 line-clamp-1">
                          {vehicle.customer?.email || "Sem e-mail"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 xl:p-5 xl:w-[320px] bg-white/[0.01] flex items-center justify-end gap-2">
                      <div className="flex items-center gap-2 w-full justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-primary/50 transition-all gap-2"
                        >
                          <Info className="size-3.5" />
                          Histórico
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-white/20 transition-all gap-2"
                        >
                          <Pencil className="size-3.5" />
                          Editar
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isDeletingCurrent}
                              className="h-9 px-4 text-[10px] font-black uppercase border-white/5 bg-white/5 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all gap-2"
                            >
                              {isDeletingCurrent ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                              Remover
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-black uppercase italic tracking-tighter text-2xl">
                                Remover Veículo?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-white/60">
                                Esta ação removerá o veículo permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(vehicle.id)}
                                className="bg-red-600 text-white hover:bg-red-700 font-bold"
                              >
                                Confirmar Remoção
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="py-16 lg:py-24 text-center border-2 border-dashed border-white/5 rounded-2xl lg:rounded-[2rem] bg-white/[0.01]">
            <Car className="size-10 lg:size-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg lg:text-xl font-black uppercase text-white/40 italic">
              Nenhum veículo encontrado
            </h3>
          </div>
        )}
      </div>

      <CreateVehicleForm
        open={isCreateVehicleModalOpen}
        onOpenChange={setCreateVehicleModalOpen}
        customers={customers}
      />
    </div>
  );
}
