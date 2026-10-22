"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const passwordRules = [
  { test: (v: string) => v.length >= 8, message: "Use 8 ou mais caracteres." },
  {
    test: (v: string) => /[A-Z]/.test(v),
    message: "Inclua uma letra maiúscula.",
  },
  {
    test: (v: string) => /[a-z]/.test(v),
    message: "Inclua uma letra minúscula.",
  },
  { test: (v: string) => /[0-9]/.test(v), message: "Inclua um número." },
];

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const invalidLink = params.get("error") === "INVALID_TOKEN" || !token;

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (invalidLink) {
    return (
      <p className="rounded-lg border bg-card p-4 text-sm">
        Este link é inválido ou expirou.{" "}
        <Link href="/forgot-password" className="text-primary hover:underline">
          Pedir um novo link
        </Link>
      </p>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const broken = passwordRules.find((rule) => !rule.test(password));
    if (broken) {
      toast.error(broken.message);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token as string,
      });
      if (error) {
        toast.error("Link inválido ou expirado. Peça um novo.");
        return;
      }
      toast.success("Senha alterada. Entre com a nova senha.");
      router.push("/auth");
    } catch {
      toast.error("Algo deu errado. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Nova senha"
        autoComplete="new-password"
        aria-label="Nova senha"
        disabled={isLoading}
        className="h-11"
      />
      <Button type="submit" size="lg" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="animate-spin" />}
        {isLoading ? "Salvando…" : "Salvar nova senha"}
      </Button>
    </form>
  );
}
