"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
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
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
});

export function SignUpForm() {
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
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              {password && <PasswordStrengthIndicator password={password} />}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[#16a34a] hover:bg-[#15803d] text-white font-medium uppercase text-sm tracking-wider"
        >
          Comece de graça
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </Form>
  );
}
