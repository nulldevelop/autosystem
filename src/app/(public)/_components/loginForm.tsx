"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import { authClient } from "@/lib/auth-client"; // Ajuste o caminho conforme seu projeto

const formSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .max(128, { message: "A senha deve ter no máximo 128 caracteres." }),
  rememberMe: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
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
          callbackURL: "/dashboard", // opcional
        },
        {
          onError: (ctx) => {
            // Tratamento específico de erros
            if (ctx.error.status === 403) {
              toast.error(
                "Por favor, verifique seu e-mail antes de fazer login",
              );
              return;
            }

            // Erro genérico
            toast.error(ctx.error.message || "E-mail ou senha inválidos");
          },
        },
      );

      if (error) {
        // Erro já tratado no onError
        return;
      }

      if (data) {
        toast.success("Login realizado com sucesso");
        router.push("/dashboard");
        router.refresh(); // Atualiza os dados do servidor
      }
    } catch (err) {
      console.error("Erro no login:", err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Digite seu e-mail de trabalho
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="me@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                  className="h-12 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus-visible:ring-[#16a34a] focus-visible:border-[#16a34a]"
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
              <FormLabel className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Digite sua senha
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                    className="h-12 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus-visible:ring-[#16a34a] focus-visible:border-[#16a34a] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-[#2a2a2a] bg-[#1a1a1a] text-[#16a34a] focus:ring-[#16a34a]"
                  />
                </FormControl>
                <FormLabel className="text-sm text-gray-400 cursor-pointer">
                  Manter conectado
                </FormLabel>
              </FormItem>
            )}
          />

          <Link
            href="/forgot-password"
            className="text-sm text-[#16a34a] hover:text-[#22c55e] transition-colors"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#16a34a] hover:bg-[#15803d] text-white font-medium uppercase text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Entrando..." : "Entrar"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </Form>
  );
}
