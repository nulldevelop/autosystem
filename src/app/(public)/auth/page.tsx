"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import router from "next/router";
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
import { logIn } from "../_actions/login";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
});

const signUpSchema = formSchema.extend({
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
});


export default function SignUpPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(isLogin ? formSchema : signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = form.watch("password");

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    form.reset();
    setShowPassword(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      if (isLogin) {
        const result = await logIn(values);
        if (!result.success) {
          const { fieldErrors } = result.error;
          if (fieldErrors) {
            (
              Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>
            ).forEach((field) => {
              const errors = fieldErrors[field];
              if (errors?.[0]) {
                form.setError(field, { message: errors[0] });
              }
            });
          } else {
            toast.error(result.error.message);
          }
        } else {
          toast.success(result.message);
          router.push("/dashboard");
        }
      } else {
        const result = await signUp(values);

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
          toast.success(result.message);
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden">
      <div
        className={`w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative z-10 transition-all duration-700 ease-in-out ${
          isLogin ? "lg:translate-x-full" : "lg:translate-x-0"
        }`}
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Crie uma conta"}
            </h1>
            <p className="text-sm text-gray-400">
              {isLogin ? (
                <>
                  Não tem uma conta?{" "}
                  <Button
                    type="button"
                    onClick={handleToggleForm}
                    className="underline underline-offset-4 hover:text-[#22c55e] transition-colors p-2 text-white mx-1"
                  >
                    Cadastre-se
                  </Button>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <Button
                    type="button"
                    onClick={handleToggleForm}
                    className="underline underline-offset-4 hover:text-[#22c55e] transition-colors p-2 text-white mx-1"
                  >
                    Entrar
                  </Button>
                </>
              )}
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        Nome
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Seu nome"
                          {...field}
                          className="h-12 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus-visible:ring-[#16a34a] focus-visible:border-[#16a34a]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                        placeholder="me@example.com"
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
                          {...field}
                          className="h-12 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500 focus-visible:ring-[#16a34a] focus-visible:border-[#16a34a] pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    {!isLogin && password && (
                      <PasswordStrengthIndicator password={password} />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isLogin && (
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#16a34a] hover:text-[#22c55e] transition-colors"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-[#16a34a] hover:bg-[#15803d] text-white font-medium uppercase text-sm tracking-wider"
              >
                {isLogin ? "Entrar" : "Comece de graça"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="space-y-4">
            {/* Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-[#1a1a1a] border-[#2a2a2a] text-white hover:bg-[#2a2a2a] hover:text-white font-medium uppercase text-sm tracking-wider"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>Google</title>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {isLogin ? "Entrar" : "Inscrever-se"} com o Google
            </Button>
          </div>

          {/* Footer */}
          {!isLogin && (
            <p className="text-center text-xs text-gray-500">
              Ao se inscrever, você concorda com os{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 hover:text-gray-400"
              >
                Termos de Serviço
              </Link>{" "}
              e{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-2 hover:text-gray-400"
              >
                Política de Privacidade
              </Link>
              .
            </p>
          )}
        </div>
      </div>

      <div
        className={`hidden lg:block lg:w-1/2 relative overflow-hidden transition-all duration-700 ease-in-out ${
          isLogin ? "lg:-translate-x-full" : "lg:translate-x-0"
        }`}
      >
        <Image
          src="/images/img-login.jpg"
          alt="Imagem de Login"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
    </div>
  );
}
