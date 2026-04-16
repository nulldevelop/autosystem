"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { adjustStock } from "../_actions/adjust-stock";
import type { Product } from "@/generated/prisma/client";

const formSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("A quantidade deve ser positiva."),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  reason: z.string().min(1, "O motivo é obrigatório."),
});

export function AdjustStockModal({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: product?.id || "",
      quantity: 1,
      type: "IN",
      reason: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        productId: product.id,
        quantity: 1,
        type: "IN",
        reason: "",
      });
    }
  }, [product, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await adjustStock(values);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao ajustar estoque");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Ajustar <span className="text-primary">Estoque</span>
          </DialogTitle>
          <DialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
            {product?.name} - Saldo atual: {product?.stockQuantity} {product?.unit}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">Tipo de Movimentação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      <SelectItem value="IN">Entrada (+)</SelectItem>
                      <SelectItem value="OUT">Saída (-)</SelectItem>
                      <SelectItem value="ADJUSTMENT">Ajuste de Saldo (=)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className="bg-white/5 border-white/10"
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">Motivo / Observação</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra de fornecedor, Ajuste de inventário..." className="bg-white/5 border-white/10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 text-[10px] font-black uppercase">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 glow-primary uppercase font-black italic">
                {isLoading ? "Processando..." : "Confirmar Ajuste"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
