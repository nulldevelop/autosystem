"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
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
  DialogFooter,
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
import {
  TransactionCategory,
  TransactionStatus,
  TransactionType,
} from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { createTransaction } from "../_actions/create-transaction";

const formSchema = z.object({
  description: z.string().min(3, "Descrição muito curta"),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(TransactionCategory),
  status: z.nativeEnum(TransactionStatus),
  paymentMethod: z.string().min(1, "Selecione um método"),
});

interface TransactionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType: TransactionType;
}

const STATUS_OPTIONS = [
  { label: "Pago / Recebido", value: "PAID" },
  { label: "Pendente", value: "PENDING" },
];

const CATEGORY_OPTIONS = [
  { label: "Aluguel", value: "RENT" },
  { label: "Salários", value: "SALARY" },
  { label: "Impostos", value: "TAX" },
  { label: "Peças/Produtos", value: "PRODUCT" },
  { label: "Serviços", value: "SERVICE" },
  { label: "Outros", value: "OTHER" },
];

const PAYMENT_METHODS = [
  { label: "PIX", value: "PIX" },
  { label: "Dinheiro", value: "CASH" },
  { label: "Cartão de Crédito", value: "CREDIT_CARD" },
  { label: "Cartão de Débito", value: "DEBIT_CARD" },
  { label: "Transferência", value: "TRANSFER" },
];

type FormValues = {
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  status: TransactionStatus;
  paymentMethod: string;
};

export function TransactionFormModal({
  open,
  onOpenChange,
  defaultType,
}: TransactionFormModalProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormValues>({
    // biome-ignore lint/suspicious/noExplicitAny: Tipagem explícita para evitar falha no build por mismatch do zodResolver
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      description: "",
      amount: 0,
      type: defaultType,
      category: "OTHER",
      status: "PAID",
      paymentMethod: "PIX",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      const res = await createTransaction({
        ...values,
        dueDate: new Date(),
      } as any);

      if (res.success) {
        toast.success(res.message);
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(res.message);
      }
    } catch (_error) {
      toast.error("Erro ao salvar transação.");
    } finally {
      setIsPending(false);
    }
  };

  const isExpense = defaultType === "EXPENSE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-lg",
                isExpense
                  ? "bg-secondary/20 text-secondary"
                  : "bg-emerald-500/20 text-emerald-500",
              )}
            >
              <DollarSign className="size-5" />
            </div>
            {isExpense ? "Lançar Despesa" : "Receita Manual"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Descrição / Fornecedor
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      placeholder={
                        isExpense
                          ? "Ex: Aluguel, Peças, Luz..."
                          : "Ex: Venda de Acessórios..."
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg h-11 px-4 text-sm focus:border-primary/50 outline-none transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Valor (R$)
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg h-11 px-4 text-sm focus:border-primary/50 outline-none transition-all font-bold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                      Status
                    </FormLabel>
                    <Combobox
                      value={field.value}
                      onValueChange={field.onChange}
                      data={STATUS_OPTIONS}
                      type="status"
                    >
                      <ComboboxTrigger className="bg-white/[0.03] border-white/10 h-11 justify-between font-normal" />
                      <ComboboxContent className="bg-zinc-950 border-white/10">
                        <ComboboxInput placeholder="Buscar status..." />
                        <ComboboxList>
                          <ComboboxEmpty>
                            Nenhum status encontrado.
                          </ComboboxEmpty>
                          <ComboboxGroup>
                            {STATUS_OPTIONS.map((option) => (
                              <ComboboxItem
                                key={option.value}
                                value={option.value}
                                className="text-white hover:bg-white/5"
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                      Categoria
                    </FormLabel>
                    <Combobox
                      value={field.value}
                      onValueChange={field.onChange}
                      data={CATEGORY_OPTIONS}
                      type="categoria"
                    >
                      <ComboboxTrigger className="bg-white/[0.03] border-white/10 h-11 justify-between font-normal" />
                      <ComboboxContent className="bg-zinc-950 border-white/10">
                        <ComboboxInput placeholder="Buscar categoria..." />
                        <ComboboxList>
                          <ComboboxEmpty>
                            Nenhuma categoria encontrada.
                          </ComboboxEmpty>
                          <ComboboxGroup>
                            {CATEGORY_OPTIONS.map((option) => (
                              <ComboboxItem
                                key={option.value}
                                value={option.value}
                                className="text-white hover:bg-white/5"
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
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                      Método
                    </FormLabel>
                    <Combobox
                      value={field.value}
                      onValueChange={field.onChange}
                      data={PAYMENT_METHODS}
                      type="método"
                    >
                      <ComboboxTrigger className="bg-white/[0.03] border-white/10 h-11 justify-between font-normal" />
                      <ComboboxContent className="bg-zinc-950 border-white/10">
                        <ComboboxInput placeholder="Buscar método..." />
                        <ComboboxList>
                          <ComboboxEmpty>
                            Nenhum método encontrado.
                          </ComboboxEmpty>
                          <ComboboxGroup>
                            {PAYMENT_METHODS.map((method) => (
                              <ComboboxItem
                                key={method.value}
                                value={method.value}
                                className="text-white hover:bg-white/5"
                              >
                                {method.label}
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
            </div>

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-white/40 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className={cn(
                  "font-black uppercase italic tracking-tighter px-8",
                  isExpense
                    ? "bg-secondary text-white hover:bg-secondary/90"
                    : "bg-primary text-black hover:bg-primary/90",
                )}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Confirmar Lançamento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
