"use client";

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
import type { Customer } from "@/generated/prisma/client";
import { extractCnpj, formatCnpj } from "@/utils/formatCNPJ";
import { extractCpf, formatCpf } from "@/utils/formatCpf";
import { formatPhone } from "@/utils/formatPhone";
import { updateCustomer } from "../_actions/update-customer";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do cliente deve ter pelo menos 2 caracteres.",
  }),
  email: z.email({
    message: "Por favor, insira um email válido.",
  }),
  phone: z.string().min(11, {
    message: "O telefone deve ter pelo menos 11 caracteres.",
  }),
  document: z.string().min(11, {
    message: "O CPF/CNPJ deve ter pelo menos 11 caracteres.",
  }),
  address: z.string().optional(),
});

interface EditCustomerFormProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomerForm({
  customer,
  open,
  onOpenChange,
}: EditCustomerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      document: "",
      address: "",
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone ? formatPhone(customer.phone) : "",
        document: customer.documentType === "CPF" 
          ? formatCpf(customer.document) 
          : formatCnpj(customer.document),
        address: customer.address || "",
      });
    }
  }, [customer, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!customer) return;
    
    setIsLoading(true);
    const rawDocument =
      values.document.length > 14
        ? extractCnpj(values.document)
        : extractCpf(values.document);
    const documentType = values.document.length > 14 ? "CNPJ" : "CPF";
    
    try {
      const result = await updateCustomer({
        id: customer.id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        document: rawDocument,
        documentType: documentType,
        address: values.address,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value.replace(/\D/g, "").length <= 11) {
      form.setValue("document", formatCpf(value));
    } else {
      form.setValue("document", formatCnpj(value));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)] overflow-y-auto bg-zinc-950 border-white/10 text-white p-4 sm:p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">
            Editar Cliente
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            Atualize os dados do cliente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: João da Silva"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Ex: joao.silva@email.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Rua das Flores, 123"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: (11) 91234-5678"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => {
                        const formattedValue = formatPhone(e.target.value);
                        field.onChange(formattedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 123.456.789-00 ou 12.345.678/0001-90"
                      disabled={isLoading}
                      {...field}
                      onChange={handleDocumentChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
