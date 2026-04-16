"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/kibo-ui/combobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createVehicle } from "../_actions/create-vehicle";

const CAR_BRANDS = [
  { label: "Volkswagen", value: "Volkswagen" },
  { label: "Fiat", value: "Fiat" },
  { label: "Chevrolet", value: "Chevrolet" },
  { label: "Ford", value: "Ford" },
  { label: "Toyota", value: "Toyota" },
  { label: "Honda", value: "Honda" },
  { label: "Hyundai", value: "Hyundai" },
  { label: "Renault", value: "Renault" },
  { label: "Jeep", value: "Jeep" },
  { label: "Nissan", value: "Nissan" },
  { label: "Mitsubishi", value: "Mitsubishi" },
  { label: "BMW", value: "BMW" },
  { label: "Mercedes-Benz", value: "Mercedes-Benz" },
  { label: "Audi", value: "Audi" },
  { label: "Volvo", value: "Volvo" },
  { label: "Kia", value: "Kia" },
  { label: "Peugeot", value: "Peugeot" },
  { label: "Citroën", value: "Citroën" },
  { label: "Chery", value: "Chery" },
  { label: "Land Rover", value: "Land Rover" },
];

const formSchema = z.object({
  marca: z
    .string()
    .min(2, { message: "A marca deve ter pelo menos 2 caracteres." }),
  model: z
    .string()
    .min(2, { message: "O modelo deve ter pelo menos 2 caracteres." }),
  year: z.number().min(1900, { message: "O ano deve ser válido." }),
  licensePlate: z
    .string()
    .min(7, { message: "A placa deve ter pelo menos 7 caracteres." }),
  customerId: z.string({ message: "Selecione um cliente." }),
});

interface CreateVehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: { id: string; name: string }[];
}

export function CreateVehicleForm({
  open,
  onOpenChange,
  customers,
}: CreateVehicleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marca: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
    },
  });

  const customerOptions = useMemo(() => {
    return customers.map((customer) => ({
      value: customer.id,
      label: customer.name,
    }));
  }, [customers]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await createVehicle(values);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      form.reset();
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar veículo:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] overflow-y-auto bg-zinc-950 border-white/10 text-white p-4 sm:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-white">
            Novo <span className="text-primary">Veículo</span>
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Preencha os dados do veículo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">
                    Cliente
                  </FormLabel>
                  <Combobox
                    data={customerOptions}
                    onValueChange={field.onChange}
                    value={field.value}
                    type="cliente"
                  >
                    <FormControl>
                      <ComboboxTrigger className="bg-white/5 border-white/5 h-12 text-white" />
                    </FormControl>
                    <ComboboxContent className="bg-zinc-900 border-white/10">
                      <ComboboxInput
                        placeholder="Pesquisar cliente..."
                        className="text-white"
                      />
                      <ComboboxEmpty>Cliente não encontrado.</ComboboxEmpty>
                      <ComboboxList>
                        <ComboboxGroup>
                          {customerOptions.map((option) => (
                            <ComboboxItem
                              key={option.value}
                              value={option.value}
                              className="text-white hover:bg-white/10"
                            >
                              {option.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="marca"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">
                    Marca
                  </FormLabel>
                  <Combobox
                    data={CAR_BRANDS}
                    onValueChange={field.onChange}
                    value={field.value}
                    type="marca"
                  >
                    <FormControl>
                      <ComboboxTrigger className="bg-white/5 border-white/5 h-12 text-white" />
                    </FormControl>
                    <ComboboxContent className="bg-zinc-900 border-white/10">
                      <ComboboxInput
                        placeholder="Pesquisar marca..."
                        className="text-white"
                      />
                      <ComboboxEmpty>Marca não encontrada.</ComboboxEmpty>
                      <ComboboxList>
                        <ComboboxGroup>
                          {CAR_BRANDS.map((brand) => (
                            <ComboboxItem
                              key={brand.value}
                              value={brand.value}
                              className="text-white hover:bg-white/10"
                            >
                              {brand.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">
                    Modelo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Gol"
                      disabled={isLoading}
                      className="bg-white/5 border-white/5 h-12 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">
                      Ano
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 2023"
                        disabled={isLoading}
                        className="bg-white/5 border-white/5 h-12 text-white"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">
                      Placa
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: ABC1234"
                        disabled={isLoading}
                        className="bg-white/5 border-white/5 h-12 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 font-black uppercase italic tracking-tighter glow-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Criando...
                </>
              ) : (
                "Criar Veículo"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
