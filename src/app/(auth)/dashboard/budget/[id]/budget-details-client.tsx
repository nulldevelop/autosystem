"use client";

import {
  ArrowLeft,
  Car,
  Image as ImageIcon,
  Loader2,
  Plus,
  Send,
  User,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { LineItems } from "@/components/app/line-items";
import { Plate } from "@/components/app/plate";
import { BudgetStatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { addBudgetPhoto } from "../_actions/add-budget-photo";
import { PDFDownloadButton } from "../_components/PDFDownloadButton";
import { PDFServiceOrderDownloadButton } from "../_components/PDFServiceOrderDownloadButton";
import type { BudgetDetails } from "../_data-access/get-budget-details";

interface BudgetDetailsClientProps {
  budget: BudgetDetails;
}

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

function InfoCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4 text-primary" aria-hidden />
          {title}
        </h2>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function BudgetDetailsClient({ budget }: BudgetDetailsClientProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSend = () => {
    const phone = budget.customer.phone?.replace(/\D/g, "");
    if (!phone) {
      toast.error("O cliente não tem telefone cadastrado.");
      return;
    }
    const message = `Olá ${budget.customer.name}!\n\nSegue o seu orçamento (${brl(budget.totalAmount)}).\nPara visualizar e assinar online:\n${window.location.origin}/budget/sign/${budget.id}`;
    window.open(
      `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", budget.organizationId || "");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        const result = await addBudgetPhoto(budget.id, data.url);
        if (result.success) {
          toast.success("Foto anexada com sucesso");
          router.refresh();
        } else {
          toast.error(result.message || "Não foi possível salvar a foto.");
        }
      } else {
        toast.error(data.error || "Falha no envio da foto.");
      }
    } catch (_error) {
      toast.error("Não foi possível enviar a foto.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            aria-label="Voltar"
            className="shrink-0 rounded-full"
          >
            <ArrowLeft />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <BudgetStatusBadge status={budget.status} />
              <span className="num font-mono text-xs text-muted-foreground">
                #{budget.id.substring(0, 8)}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Orçamento de {budget.customer.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* biome-ignore lint/suspicious/noExplicitAny: type mismatch for pdf props */}
          <PDFDownloadButton budget={budget as any} />
          {/* biome-ignore lint/suspicious/noExplicitAny: type mismatch for pdf props */}
          <PDFServiceOrderDownloadButton budget={budget as any} />
          <Button onClick={handleSend}>
            <Send /> Enviar ao cliente
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <InfoCard icon={User} title="Cliente">
            <p className="font-semibold">{budget.customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {budget.customer.email || "Sem e-mail"}
            </p>
            <p className="num text-sm text-muted-foreground">
              {budget.customer.phone || "Sem telefone"}
            </p>
          </InfoCard>

          <InfoCard icon={Car} title="Veículo">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <p className="font-semibold">
                  {budget.vehicle.marca} {budget.vehicle.model}
                </p>
                <Plate value={budget.vehicle.licensePlate} />
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Ano</p>
                <p className="num font-medium">{budget.vehicle.year}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">Quilometragem</span>
              <span className="num font-medium">
                {budget.kilometers
                  ? `${budget.kilometers.toLocaleString("pt-BR")} km`
                  : "Não informada"}
              </span>
            </div>
          </InfoCard>

          <InfoCard
            icon={ImageIcon}
            title="Fotos"
            action={
              budget.photos?.length > 0 ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  aria-label="Anexar foto"
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus />
                  )}
                </Button>
              ) : undefined
            }
          >
            {budget.photos?.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2">
                {/* biome-ignore lint/suspicious/noExplicitAny: photo type is dynamic */}
                {budget.photos.map((photo: any, idx: number) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: photos are unique enough for index here
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={photo.url}
                      alt={`Foto ${idx + 1} do veículo`}
                      fill
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex w-full flex-col items-center gap-1 rounded-lg border border-dashed py-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {isUploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ImageIcon className="size-5" />
                )}
                {isUploading ? "Enviando…" : "Anexar fotos do veículo"}
              </button>
            )}
          </InfoCard>
        </div>

        <div className="lg:col-span-2">
          <LineItems items={budget.items} title="Itens e peças" />
        </div>
      </div>

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
