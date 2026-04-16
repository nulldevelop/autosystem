import { CheckCircle2, Rocket, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80svh] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />
      
      <Card className="w-full max-w-2xl border-white/5 bg-zinc-950/50 backdrop-blur-xl relative overflow-hidden">
        {/* Efeito de brilho de fundo */}
        <div className="absolute -top-24 -right-24 size-48 bg-primary/20 blur-[100px] rounded-full" />
        
        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center">
          <div className="size-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 rotate-12 animate-in zoom-in duration-500">
            <Rocket className="size-10 text-primary" />
          </div>

          <div className="space-y-4 mb-10">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
              Seja Bem-vindo ao <br />
              <span className="text-primary">Nível Profissional</span>
            </h1>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
              Sua assinatura foi processada com sucesso
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
            {[
              { icon: Star, label: "Recursos Ativados" },
              { icon: CheckCircle2, label: "Acesso Ilimitado" },
              { icon: Rocket, label: "Alta Performance" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-2">
                <item.icon className="size-5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button asChild className="flex-1 glow-primary h-14 font-black uppercase italic tracking-tighter text-lg">
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                Acessar Dashboard <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
          
          <p className="mt-8 text-white/20 text-[9px] font-black uppercase tracking-widest">
            ID da Transação: {Math.random().toString(36).substring(7).toUpperCase()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
