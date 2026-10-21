"use client";

import { Loader2, PenTool, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signBudget } from "../_actions/sign-budget";

export function SignatureForm({ budgetId }: { budgetId: string }) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clear = () => {
    sigCanvas.current?.clear();
  };

  const handleSign = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Por favor, forneça uma assinatura.");
      return;
    }

    const signatureData = sigCanvas.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    if (!signatureData) return;

    setIsSubmitting(true);
    try {
      const result = await signBudget(budgetId, signatureData);
      if (result.success) {
        toast.success("Orçamento aprovado e assinado com sucesso!");
      } else {
        toast.error("Erro ao salvar assinatura.");
      }
    } catch (_error) {
      toast.error("Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-primary">Assinatura Digital</h3>
        <p className="text-xs text-muted-foreground">
          Use o seu dedo ou mouse para assinar no campo abaixo
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <Card className="relative border-border bg-card rounded-[2rem] overflow-hidden">
          <CardContent className="p-0">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="#fff"
              canvasProps={{
                className: "w-full h-64 cursor-crosshair",
              }}
            />
          </CardContent>
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-2 size-4" /> Limpar
            </Button>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <PenTool className="size-3" /> Assine aqui
            </div>
          </div>
        </Card>
      </div>

      <Button
        onClick={handleSign}
        disabled={isSubmitting}
        className="w-full h-14 text-lg font-bold tracking-tight"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" /> Processando...
          </>
        ) : (
          "Confirmar e Aprovar Orçamento"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground font-medium leading-relaxed">
        Ao clicar em confirmar, você declara estar de acordo com os valores e
        serviços descritos neste orçamento técnico. A assinatura digital possui
        validade jurídica conforme MP 2.200-2/2001.
      </p>
    </div>
  );
}
