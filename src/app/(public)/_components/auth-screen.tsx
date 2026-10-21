"use client";

import { ArrowLeft, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Plate } from "@/components/app/plate";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { TRIAL_DAYS } from "@/utils/permissions/trial-limits";
import { LoginForm } from "./loginForm";
import { SignUpForm } from "./signUpForm";

type Mode = "login" | "signup";

const HIGHLIGHTS = [
  "Orçamento enviado pelo WhatsApp e assinado no celular",
  "Ordem de serviço gerada na aprovação",
  "Estoque e financeiro no mesmo lugar",
];

const COPY: Record<Mode, { title: string; text: string }> = {
  login: {
    title: "Entrar na sua conta",
    text: "Acesse o painel da sua oficina.",
  },
  signup: {
    title: "Criar sua conta",
    text: `Teste grátis por ${TRIAL_DAYS} dias. Sem instalar nada.`,
  },
};

export function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "signup" ? "signup" : "login",
  );
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (session && !isPending) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending || session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          role="status"
          aria-label="Carregando"
          className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary"
        />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1.05fr_1fr]">
      {/* Painel da marca: fixo escuro nos dois temas, texto sempre claro */}
      <aside className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <Image
          src="/images/img-login.jpg"
          alt=""
          fill
          sizes="55vw"
          priority
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/90"
        />

        <Link
          href="/"
          className="relative z-10 flex w-fit items-center gap-2.5"
        >
          <Logo className="size-9" />
          <span className="font-display text-xl font-semibold tracking-tight">
            Auto<span className="text-[oklch(0.78_0.17_152)]">System</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="flex items-center gap-3">
            <Plate value="KDF5M78" className="text-base" />
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/25 bg-white/10 px-2 py-1 text-xs font-medium backdrop-blur">
              <Check className="size-3.5 text-[oklch(0.78_0.17_152)]" />
              Orçamento aprovado
            </span>
          </div>
          <h2 className="text-4xl font-semibold tracking-tight text-balance">
            Do orçamento ao recibo, sem papel.
          </h2>
          <ul className="space-y-2.5 text-white/85">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-[oklch(0.78_0.17_152)]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col px-5 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar ao site
          </Link>
          <ThemeToggle />
        </div>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo className="size-9" />
            <span className="font-display text-xl font-semibold tracking-tight">
              Auto<span className="text-primary">System</span>
            </span>
          </Link>

          <div
            role="tablist"
            aria-label="Acesso"
            className="grid grid-cols-2 gap-1 rounded-lg border bg-surface p-1"
          >
            {(
              [
                { value: "login", label: "Entrar" },
                { value: "signup", label: "Criar conta" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={mode === tab.value}
                onClick={() => setMode(tab.value)}
                className={cn(
                  "min-h-10 rounded-md text-sm font-medium transition-colors",
                  mode === tab.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            key={mode}
            className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {COPY[mode].title}
            </h1>
            <p className="mt-1.5 text-muted-foreground">{COPY[mode].text}</p>

            <div className="mt-7">
              {mode === "login" ? (
                <LoginForm defaultEmail={email} />
              ) : (
                <SignUpForm
                  onSuccess={(createdEmail) => {
                    setEmail(createdEmail);
                    setMode("login");
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
