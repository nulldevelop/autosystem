"use client";

import { Loader2, PenTool, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signServiceOrder } from "../../_actions/sign-service-order";

export function SignatureForm({ serviceOrderId }: { serviceOrderId: string }) {
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
      const result = await signServiceOrder(serviceOrderId, signatureData);
      if (result.success) {
        toast.success("O.S. assinada com sucesso!");
      } else {
        toast.error(result.message || "Erro ao salvar assinatura.");
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
        <h3 className="text-xs font-bold text-primary">
          Assinatura Digital da O.S.
        </h3>
        <p className="text-xs text-muted-foreground">
          Confirme a autorização dos serviços em execução
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <Card className="relative border-border bg-card rounded-[2rem] overflow-hidden">
          <CardContent className="bg-white p-0">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="#0f172a"
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
        className="w-full h-14 text-lg font-bold tracking-tight bg-primary hover:bg-primary/90"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-5 animate-spin" /> Processando...
          </>
        ) : (
          "Finalizar Assinatura da O.S."
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground font-medium leading-relaxed">
        Ao assinar, você autoriza formalmente o início ou continuação dos
        trabalhos técnicos descritos nesta Ordem de Serviço. Este registro
        eletrônico possui validade técnica e jurídica.
      </p>
    </div>
  );
}
