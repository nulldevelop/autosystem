import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { extractCnpj, formatCnpj } from "@/utils/formatCNPJ";
import { extractCpf, formatCpf } from "@/utils/formatCpf";
import { formatPhone } from "@/utils/formatPhone";
import { createCustomer } from "../_actions/create-customer";

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

export function CreateCustomerForm({
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
      email: "",
      phone: "",
      document: "",
      address: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const rawDocument =
      values.document.length > 14
        ? extractCnpj(values.document)
        : extractCpf(values.document);
    const documentType = values.document.length > 14 ? "CNPJ" : "CPF";
    try {
      const result = await createCustomer({
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
      form.reset();
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value.replace(/\D/g, "").length <= 11) {
      // Assuming CPF has 11 digits
      form.setValue("document", formatCpf(value));
    } else {
      // Assuming CNPJ has more than 11 digits
      form.setValue("document", formatCnpj(value));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar um novo cliente.
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
              {isLoading ? "Criando..." : "Criar Cliente"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
