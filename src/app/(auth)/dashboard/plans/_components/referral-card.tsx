"use client";

import { Check, Copy, Gift } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ReferralCardProps {
  code: string;
  stats: { invited: number; rewarded: number; monthsEarned: number };
}

export function ReferralCard({ code, stats }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const link = `${window.location.origin}/auth?mode=signup&ref=${code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-labelledby="referral-title"
      className="rounded-xl border bg-card p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <Gift className="size-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 id="referral-title" className="text-lg font-semibold">
            Indique e ganhe 2 meses grátis
          </h2>
          <p className="text-sm text-muted-foreground">
            Quando alguém criar a conta pelo seu link e fizer o primeiro
            pagamento, você ganha 2 meses de acesso grátis.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="num min-w-0 flex-1 truncate rounded-lg border bg-muted px-3 py-2.5 text-sm">
          {code}
        </code>
        <Button onClick={handleCopy} variant="outline" className="sm:w-auto">
          {copied ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
          {copied ? "Link copiado" : "Copiar link de indicação"}
        </Button>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-4 border-t pt-5 text-sm">
        <div>
          <dt className="text-muted-foreground">Convidados</dt>
          <dd className="num text-xl font-semibold">{stats.invited}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Já pagaram</dt>
          <dd className="num text-xl font-semibold">{stats.rewarded}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Meses ganhos</dt>
          <dd className="num text-xl font-semibold">{stats.monthsEarned}</dd>
        </div>
      </dl>
    </section>
  );
}
