"use client";

import { Download, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount } from "../_actions/delete-account";

const CONFIRM_WORD = "EXCLUIR";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit =
    password.length > 0 && confirmation === CONFIRM_WORD && !isLoading;

  async function handleDelete() {
    setIsLoading(true);
    try {
      const result = await deleteAccount({ password });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      // a sessão deixou de existir: navegação completa para limpar o estado
      window.location.assign("/");
    } catch {
      toast.error("Não foi possível excluir a conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-destructive/40 bg-card p-4 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-destructive">
          Seus dados (LGPD)
        </h2>
        <p className="text-sm text-muted-foreground">
          Você pode baixar uma cópia dos seus dados em JSON ou excluir a conta
          (art. 18 da LGPD). A exclusão apaga seu acesso e todos os dados da
          oficina (clientes, veículos, orçamentos, ordens de serviço, estoque,
          financeiro e arquivos). A assinatura é cancelada. A ação é definitiva
          e não pode ser desfeita. Registros de pagamento são mantidos pelo
          prazo exigido em lei. Saiba mais em{" "}
          <Link
            href="/data-deletion"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Exclusão de Dados
          </Link>
          .
        </p>
      </div>

      <Button asChild variant="outline" className="w-full sm:w-auto">
        <a href="/api/account/export" download>
          <Download className="mr-2 size-4" />
          Baixar meus dados
        </a>
      </Button>

      <AlertDialog
        open={open}
        onOpenChange={(next) => {
          if (isLoading) return;
          setOpen(next);
          if (!next) {
            setPassword("");
            setConfirmation("");
          }
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full sm:w-auto">
            <Trash2 className="mr-2 size-4" />
            Excluir minha conta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados da sua oficina serão apagados e não poderão ser
              recuperados. Baixe antes seus dados, se precisar guardá-los.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">Sua senha</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">
                Digite {CONFIRM_WORD} para confirmar
              </Label>
              <Input
                id="delete-confirm"
                autoComplete="off"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!canSubmit}
              onClick={handleDelete}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir definitivamente"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
