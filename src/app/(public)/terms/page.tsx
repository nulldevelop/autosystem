import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/auth">
          <Button
            variant="ghost"
            className="text-neutral-400 hover:text-white mb-4 pl-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Termos de Serviço</h1>
        <p className="text-sm text-neutral-400">Última atualização: 2026</p>

        <section className="space-y-4 text-neutral-300 leading-relaxed">
          <h2 className="text-xl font-semibold text-white">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar e utilizar o AutoSystem, você concorda em cumprir e estar
            vinculado aos seguintes termos e condições de uso.
          </p>

          <h2 className="text-xl font-semibold text-white">
            2. Uso do Sistema
          </h2>
          <p>
            O AutoSystem fornece ferramentas para gestão de oficinas,
            orçamentos, ordens de serviço e controle financeiro. Você é
            responsável por manter a confidencialidade de sua conta e senha.
          </p>

          <h2 className="text-xl font-semibold text-white">
            3. Responsabilidades
          </h2>
          <p>
            As informações inseridas no sistema são de inteira responsabilidade
            do usuário contratante, garantindo que os dados de clientes e
            transações sejam legítimos.
          </p>
        </section>
      </div>
    </div>
  );
}
