import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Customer, Product, Vehicle } from "@/generated/prisma/client";
import { getCustomers } from "../../customer/_data-access/get-customers";
import { getProducts } from "../../product/_data-access/get-products";
import { getVehicles } from "../../vehicle/_data-access/get-vehicles";
import { createBudget } from "../_actions/create-budget";

const formSchema = z.object({
  customerId: z.string().min(1, "Selecione um cliente."),
  vehicleId: z.string().min(1, "Selecione um veículo."),
  observacoes: z.string().optional(),
  profitMargin: z.number().min(0, "A margem de lucro não pode ser negativa."),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        productName: z.string().optional(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
      }),
    )
    .min(1, "Adicione pelo menos um item ao orçamento."),
});

export function CreateBudgetForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedProductQuantity, setSelectedProductQuantity] =
    useState<number>(1);
  const [showCustomProductForm, setShowCustomProductForm] = useState(false);
  const [customProductName, setCustomProductName] = useState("");
  const [customProductPrice, setCustomProductPrice] = useState<number>(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: "",
      vehicleId: "",
      observacoes: "",
      profitMargin: 0,
      items: [],
    },
  });

  const selectedBudgetItems = form.watch("items");

  const totalCalculatedAmount = selectedBudgetItems.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0,
  );

  const finalAmountWithProfit =
    totalCalculatedAmount * (1 + form.watch("profitMargin") / 100);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        const [customersData, vehiclesData, productsData] = await Promise.all([
          getCustomers(),
          getVehicles(),
          getProducts(),
        ]);
        setCustomers(customersData);
        setVehicles(vehiclesData);
        setProducts(productsData);
      };
      fetchData();
    }
  }, [open]);

  const handleAddProduct = (isCustom: boolean = false) => {
    if (isCustom) {
      if (
        !customProductName ||
        customProductPrice <= 0 ||
        selectedProductQuantity <= 0
      ) {
        toast.error(
          "Preencha o nome, preço e quantidade do produto customizado.",
        );
        return;
      }
      form.setValue(
        "items",
        [
          ...selectedBudgetItems,
          {
            productId: `custom-${Date.now()}`,
            productName: customProductName,
            quantity: selectedProductQuantity,
            unitPrice: customProductPrice,
          },
        ],
        { shouldValidate: true },
      );
      setCustomProductName("");
      setCustomProductPrice(0);
      setSelectedProductQuantity(1);
      setShowCustomProductForm(false);
      return;
    }

    if (!selectedProduct || selectedProductQuantity <= 0) {
      toast.error("Selecione um produto e uma quantidade válida.");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      toast.error("Produto não encontrado.");
      return;
    }

    const existingItemIndex = selectedBudgetItems.findIndex(
      (item) => item.productId === selectedProduct,
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...selectedBudgetItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity:
          updatedItems[existingItemIndex].quantity + selectedProductQuantity,
      };
      form.setValue("items", updatedItems, { shouldValidate: true });
    } else {
      form.setValue(
        "items",
        [
          ...selectedBudgetItems,
          {
            productId: selectedProduct,
            quantity: selectedProductQuantity,
            unitPrice: product.price,
          },
        ],
        { shouldValidate: true },
      );
    }

    setSelectedProduct("");
    setSelectedProductQuantity(1);
  };

  const handleRemoveProduct = (productId: string) => {
    form.setValue(
      "items",
      selectedBudgetItems.filter((item) => item.productId !== productId),
      { shouldValidate: true },
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await createBudget({
        ...values,
        items: values.items,
        profitMargin: values.profitMargin,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      form.reset();
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar orçamento:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl w-[70vw]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Orçamento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar um novo orçamento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-1">Cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-1">Veículo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um veículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {vehicles
                          .filter(
                            (vehicle) =>
                              vehicle.customerId === form.watch("customerId"),
                          )
                          .map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.model} - {vehicle.licensePlate}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-lg font-medium">Itens do Orçamento</h3>

              {showCustomProductForm ? (
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1">
                    <FormLabel className="mb-1">
                      Nome do Produto Customizado
                    </FormLabel>
                    <Input
                      placeholder="Nome do Produto Customizado"
                      value={customProductName}
                      onChange={(e) => setCustomProductName(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <FormLabel className="mb-1">Preço do Produto</FormLabel>
                    <Input
                      type="number"
                      placeholder="Preço do Produto"
                      value={customProductPrice}
                      onChange={(e) =>
                        setCustomProductPrice(e.target.valueAsNumber)
                      }
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div>
                      <FormLabel className="mb-1">Quantidade</FormLabel>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Quantidade"
                        value={selectedProductQuantity}
                        onChange={(e) =>
                          setSelectedProductQuantity(e.target.valueAsNumber)
                        }
                        className="w-24"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleAddProduct(true)}
                    >
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomProductForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <FormLabel className="mb-1">Produto</FormLabel>
                    <Select
                      onValueChange={setSelectedProduct}
                      value={selectedProduct}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.price)}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <div>
                      <FormLabel className="mb-1">Quantidade</FormLabel>
                      <Input
                        type="number"
                        min="1"
                        value={selectedProductQuantity}
                        onChange={(e) =>
                          setSelectedProductQuantity(e.target.valueAsNumber)
                        }
                        disabled={isLoading}
                        className="w-24"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleAddProduct()}
                      disabled={isLoading || !selectedProduct}
                    >
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomProductForm(true)}
                    >
                      Produto Customizado
                    </Button>
                  </div>
                </div>
              )}

              {selectedBudgetItems.length > 0 && (
                <ul className="space-y-2">
                  {selectedBudgetItems.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId,
                    );
                    return (
                      <li
                        key={item.productId}
                        className="flex items-center justify-between rounded-md bg-muted p-2"
                      >
                        <span>
                          {product?.name || item.productName} x {item.quantity}{" "}
                          (
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(item.quantity * item.unitPrice)}
                          )
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveProduct(item.productId)}
                          disabled={isLoading}
                        >
                          Remover
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="profitMargin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1">Margem de Lucro (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 10"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right text-lg font-bold">
              Valor Total:{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(finalAmountWithProfit)}
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1">Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes sobre o orçamento..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Criando..." : "Criar Orçamento"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
