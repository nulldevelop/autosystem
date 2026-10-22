"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { signUp } from "@/app/(public)/_actions/sign-up";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordStrengthIndicator } from "@/utils/PasswordStrengthIndicator";

const signUpSchema = z.object({
  name: z.string().min(3, { message: "Informe seu nome completo." }),
  email: z.email({ message: "Informe um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha precisa de 8 ou mais caracteres." })
    .regex(/[A-Z]/, { message: "Inclua uma letra maiúscula." })
    .regex(/[a-z]/, { message: "Inclua uma letra minúscula." })
    .regex(/[0-9]/, { message: "Inclua um número." }),
});

export function SignUpForm({
  onSuccess,
}: {
  onSuccess?: (email: string) => void;
}) {
  const referralCode = useSearchParams().get("ref") ?? undefined;
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = form.watch("password");

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    startTransition(async () => {
      const result = await signUp({ ...values, referralCode });

      if (!result.success) {
        if (result.error.fieldErrors) {
          Object.entries(result.error.fieldErrors).forEach(
            ([field, errors]) => {
              if (errors && errors.length > 0) {
                form.setError(field as "name" | "email" | "password", {
                  message: errors[0],
                });
              }
            },
          );
        } else {
          toast.error(result.error.message);
        }
      } else {
        toast.success("Conta criada. Entre com seu e-mail e senha.");
        onSuccess?.(values.email);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  disabled={isPending}
                  className="h-11"
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
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="voce@suaoficina.com.br"
                  autoComplete="email"
                  disabled={isPending}
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha"
                    autoComplete="new-password"
                    disabled={isPending}
                    className="h-11 pr-11"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {password ? (
                <PasswordStrengthIndicator password={password} />
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="animate-spin" /> : null}
          {isPending ? "Criando conta…" : "Criar conta grátis"}
          {!isPending && <ArrowRight />}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Ao criar a conta, você concorda com os{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Termos de Serviço
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Política de Privacidade
          </Link>
          .
        </p>
      </form>
    </Form>
  );
}
