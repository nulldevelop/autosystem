import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-green-500/20 p-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white">
            Assinatura Confirmada!
          </h1>
          <p className="text-gray-400 max-w-md">
            Sua assinatura foi processada com sucesso. Você já pode aproveitar
            todos os recursos do seu plano.
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <Button asChild className="bg-green-500 hover:bg-green-600 text-black">
          <Link href="/dashboard">Ir para Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/plans">Ver Planos</Link>
        </Button>
      </div>
    </div>
  );
}
