"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { logIn } from "../_actions/login";

const formSchema = z.object({
  email: z.email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
});

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await logIn(values);
      if (!result.success) {
        const { fieldErrors } = result.error;
        if (fieldErrors) {
          (Object.keys(fieldErrors) as Array<keyof typeof fieldErrors>).forEach(
            (field) => {
              const errors = fieldErrors[field];
              if (errors?.[0]) {
                form.setError(field, { message: errors[0] });
              }
            },
          );
        } else {
          toast.error(result.error.message);
        }
      } else {
        toast.success(result.message);
        router.push("/dashboard");
        router.refresh();
      }
    });
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
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-[#16a34a] hover:text-[#22c55e] transition-colors"
          >
            Esqueceu sua senha?
          </Link>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-[#16a34a] hover:bg-[#15803d] text-white font-medium uppercase text-sm tracking-wider"
        >
          Entrar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </Form>
  );
}
