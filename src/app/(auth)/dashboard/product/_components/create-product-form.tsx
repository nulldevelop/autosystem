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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct } from "../_actions/create-product";

const formSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório."),
  price: z.number().nonnegative("O preço deve ser um número positivo."),
  costPrice: z
    .number()
    .nonnegative("O preço de custo deve ser um número positivo."),
  sku: z.string().min(1, "O SKU é obrigatório."),
  category: z.string().min(1, "A categoria é obrigatória."),
  unit: z.string().min(1, "A unidade é obrigatória."),
  stockQuantity: z
    .number()
    .int()
    .nonnegative("A quantidade deve ser positiva."),
  minStock: z.number().int().nonnegative("O estoque mínimo deve ser positivo."),
});

const CATEGORIES = [
  "Óleos e Fluidos",
  "Filtros",
  "Suspensão",
  "Freios",
  "Pneus",
  "Iluminação",
  "Baterias",
  "Motor",
  "Acessórios",
  "Geral",
];

const UNITS = ["UN", "LT", "KG", "PAR", "KIT", "MT"];

export function CreateProductForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      costPrice: 0,
      sku: "",
      category: "Geral",
      unit: "UN",
      stockQuantity: 0,
      minStock: 0,
    },
  });

  // Geração automática de SKU
  const name = form.watch("name");
  const category = form.watch("category");
  const unit = form.watch("unit");

  useEffect(() => {
    const currentSku = form.getValues("sku");
    // Só gera se o nome tiver pelo menos 3 letras e o SKU estiver vazio ou for um gerado automaticamente (padrão)
    if (
      name &&
      name.length >= 3 &&
      category &&
      unit &&
      (!currentSku || currentSku.includes("-"))
    ) {
      const cleanName = name.trim().split(" ")[0].substring(0, 3).toUpperCase();
      const cleanCat = category.trim().substring(0, 3).toUpperCase();
      const cleanUnit = unit.trim().toUpperCase();

      // Criar um hash simples baseado no nome completo para manter o SKU estável mas único
      const nameHash = name.length + (name.charCodeAt(0) || 0);
      const generatedSku =
        `${cleanCat}-${cleanName}-${cleanUnit}-${nameHash}`.replace(
          /[^A-Z0-9-]/g,
          "",
        );

      form.setValue("sku", generatedSku, { shouldValidate: true });
    }
  }, [name, category, unit, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await createProduct(values);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      form.reset();
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] overflow-y-auto bg-zinc-950 border-white/10 text-white p-4 sm:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white">
            Novo <span className="text-primary">Produto</span>
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Preencha os dados do produto
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(100vh-180px)] pr-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6 py-2 sm:py-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Nome do Produto
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Óleo de Motor 5W30"
                          className="bg-white/5 border-white/10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        SKU / Código
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: PRD-001"
                          className="bg-white/5 border-white/10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Categoria
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
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
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Unidade
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Unidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          {UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
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
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Preço de Custo (R$)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-white/5 border-white/10 text-emerald-500 font-bold"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Preço de Venda (R$)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="bg-white/5 border-white/10 text-primary font-bold"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Estoque Inicial
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-white/5 border-white/10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Estoque Mínimo (Alerta)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="bg-white/5 border-white/10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 glow-primary"
                >
                  {isLoading ? "Processando..." : "Cadastrar Produto"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
