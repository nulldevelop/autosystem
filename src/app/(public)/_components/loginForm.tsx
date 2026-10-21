"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const formSchema = z.object({
  email: z.string().email({ message: "Informe um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha tem pelo menos 8 caracteres." })
    .max(128, { message: "A senha tem no máximo 128 caracteres." }),
  rememberMe: z.boolean().optional(),
});

export function LoginForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: defaultEmail,
      password: "",
      rememberMe: true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
          callbackURL: "/dashboard",
        },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast.error("Confirme seu e-mail antes de entrar.");
              return;
            }
            toast.error(ctx.error.message || "E-mail ou senha incorretos.");
          },
        },
      );

      if (error) {
        // já tratado em onError
        return;
      }

      if (data) {
        toast.success("Bem-vindo de volta");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Erro no login:", err);
      toast.error("Algo deu errado. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="voce@suaoficina.com.br"
                  autoComplete="email"
                  disabled={isLoading}
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
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="h-11 pr-11"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2.5 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal text-muted-foreground">
                Manter conectado neste aparelho
              </FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : null}
          {isLoading ? "Entrando…" : "Entrar"}
          {!isLoading && <ArrowRight />}
        </Button>
      </form>
    </Form>
  );
}
