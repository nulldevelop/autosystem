"use client";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  checkOrganizationSlug,
  createOrganization,
} from "../_actions/create-organization";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da oficina deve ter pelo menos 2 caracteres.",
  }),
  slug: z
    .string()
    .min(2, {
      message: "O slug deve ter pelo menos 2 caracteres.",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "O slug deve conter apenas letras minúsculas, números e hífens.",
    }),
  logo: z.string().url().optional().or(z.literal("")),
});

export function CreateOrganizationForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
  });

  // Gera slug automaticamente baseado no nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, "-") // Substitui espaços por hífens
      .replace(/-+/g, "-") // Remove hífens duplicados
      .trim();
  };

  // Atualiza slug quando o nome muda
  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    form.setValue("slug", slug);
  };

  // Verifica se o slug está disponível
  const handleSlugBlur = async () => {
    const slug = form.getValues("slug");
    if (!slug || slug.length < 2) return;

    setIsCheckingSlug(true);
    try {
      const result = await checkOrganizationSlug(slug);
      if (!result.available) {
        form.setError("slug", {
          type: "manual",
          message: result.message || "Este slug já está em uso",
        });
      } else {
        form.clearErrors("slug");
      }
    } catch (error) {
      console.error("Erro ao verificar slug:", error);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const result = await createOrganization({
        name: values.name,
        slug: values.slug,
        logo: values.logo || undefined,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset();
      router.push("/dashboard"); // Redireciona para o dashboard
      router.refresh(); // Atualiza os dados do servidor
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao criar oficina:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-2xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Crie sua Oficina</DialogTitle>
          <DialogDescription>
            Para começar a usar o AutoSystem, você precisa registrar sua
            oficina.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Oficina</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Auto Elétrica do Zé"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL da Oficina)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="auto-eletrica-do-ze"
                      disabled
                      {...field}
                      onBlur={(_e) => {
                        field.onBlur();
                        handleSlugBlur();
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {isCheckingSlug
                      ? "Verificando disponibilidade..."
                      : "Este será o identificador único da sua oficina"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/logo.png"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL da imagem do logo da sua oficina
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading || isCheckingSlug}
              className="w-full"
            >
              {isLoading ? "Criando..." : "Criar Oficina"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
