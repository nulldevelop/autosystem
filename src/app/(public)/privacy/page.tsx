import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/auth">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground mb-4 pl-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          Política de Privacidade
        </h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: 2026
        </p>

        <section className="space-y-4 text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            1. Coleta de Dados
          </h2>
          <p>
            Coletamos informações necessárias para a prestação de serviços da
            plataforma, incluindo nome, e-mail, documento e dados comerciais
            estritamente vinculados à sua oficina.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            2. Segurança
          </h2>
          <p>
            Empregamos medidas de segurança técnicas e administrativas para
            proteger os dados pessoais contra acessos não autorizados e
            situações acidentais ou ilícitas.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            3. Compartilhamento
          </h2>
          <p>
            Não comercializamos seus dados com terceiros. O compartilhamento
            ocorre apenas quando indispensável para a prestação dos serviços
            (como gateway de pagamento Stripe).
          </p>
        </section>
      </div>
    </div>
  );
}
