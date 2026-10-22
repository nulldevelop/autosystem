"use client";

import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error("Não foi possível enviar o e-mail. Tente novamente.");
        return;
      }
      // resposta igual exista a conta ou não, para não revelar quem tem cadastro
      setSent(true);
    } catch {
      toast.error("Algo deu errado. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border bg-card p-4 text-sm"
      >
        <MailCheck
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden
        />
        <p>
          Se existir uma conta com <strong>{email}</strong>, enviamos um link
          para criar uma nova senha. Confira também o spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@suaoficina.com.br"
        autoComplete="email"
        aria-label="E-mail"
        disabled={isLoading}
        className="h-11"
      />
      <Button type="submit" size="lg" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="animate-spin" />}
        {isLoading ? "Enviando…" : "Enviar link"}
      </Button>
    </form>
  );
}
