import {
  AlertTriangle,
  ArrowLeft,
  Headphones,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80svh] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent -z-10" />

      <Card className="w-full max-w-2xl border-border bg-card relative overflow-hidden">
        <div className="absolute -top-24 -right-24 size-48 bg-secondary/20 blur-[100px] rounded-full" />

        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center">
          <div className="size-20 rounded-3xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-8 -rotate-12 animate-in slide-in-from-top duration-500">
            <AlertTriangle className="size-10 text-secondary" />
          </div>

          <div className="space-y-4 mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Ocorreu um <span className="text-secondary">Imprevisto?</span>
            </h1>
            <p className="text-muted-foreground text-xs font-bold">
              Sua assinatura não foi concluída
            </p>
          </div>

          <p className="text-muted-foreground text-sm mb-10 max-w-md leading-relaxed">
            Percebemos que você não finalizou seu plano. Se teve algum problema
            técnico ou tem alguma dúvida, nossa equipe está pronta para te
            ajudar agora.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10 text-left">
            <div className="p-5 rounded-2xl bg-muted/50 border border-border group hover:border-primary/20 transition-colors">
              <Headphones className="size-6 text-primary mb-3" />
              <h4 className="text-xs font-bold text-foreground mb-1">
                Suporte Técnico
              </h4>
              <p className="text-xs text-muted-foreground font-bold ">
                Fale com um especialista
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-muted/50 border border-border group hover:border-secondary/20 transition-colors">
              <MessageSquare className="size-6 text-secondary mb-3" />
              <h4 className="text-xs font-bold text-foreground mb-1">
                Tirar Dúvidas
              </h4>
              <p className="text-xs text-muted-foreground font-bold ">
                WhatsApp de Atendimento
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              asChild
              variant="outline"
              className="flex-1 h-14 border-border hover:bg-muted/50 font-bold tracking-tight"
            >
              <Link
                href="/dashboard/plans"
                className="flex items-center justify-center gap-2"
              >
                <ArrowLeft className="size-4" /> Tentar Novamente
              </Link>
            </Button>
            <Button
              asChild
              className="flex-1 bg-secondary text-foreground hover:bg-secondary/90 h-14 font-bold tracking-tight shadow-lg shadow-secondary/10"
            >
              <Link
                href="https://wa.me/seu-numero"
                target="_blank"
                className="flex items-center justify-center gap-2"
              >
                Falar com Suporte <MessageSquare className="size-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
