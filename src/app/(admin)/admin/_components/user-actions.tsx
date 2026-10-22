"use client";

import { Gift, Lock, LockOpen, XCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cancelUserSubscription,
  grantFreeDays,
  setUserBlocked,
} from "../_actions/admin-actions";

interface UserActionsProps {
  userId: string;
  email: string;
  blocked: boolean;
  hasActiveSubscription: boolean;
  isAdmin: boolean;
}

export function UserActions({
  userId,
  email,
  blocked,
  hasActiveSubscription,
  isAdmin,
}: UserActionsProps) {
  const [days, setDays] = useState("30");
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ success: boolean; message: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={365}
          inputMode="numeric"
          aria-label="Dias grátis"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-24"
          disabled={isPending}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => grantFreeDays({ userId, days }))}
        >
          <Gift aria-hidden /> Dar dias grátis
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {hasActiveSubscription && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              if (
                window.confirm(
                  `Cancelar a assinatura de ${email}? A cobrança é encerrada na AbacatePay.`,
                )
              ) {
                run(() => cancelUserSubscription({ userId }));
              }
            }}
          >
            <XCircle aria-hidden /> Cancelar assinatura
          </Button>
        )}

        {!isAdmin && (
          <Button
            size="sm"
            variant={blocked ? "outline" : "destructive"}
            disabled={isPending}
            onClick={() => {
              const question = blocked
                ? `Desbloquear ${email}?`
                : `Bloquear ${email}? A pessoa será desconectada e não poderá entrar.`;
              if (window.confirm(question)) {
                run(() => setUserBlocked({ userId, blocked: !blocked }));
              }
            }}
          >
            {blocked ? <LockOpen aria-hidden /> : <Lock aria-hidden />}
            {blocked ? "Desbloquear" : "Bloquear"}
          </Button>
        )}
      </div>
    </div>
  );
}
