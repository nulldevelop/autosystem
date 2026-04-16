import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function FinanceiroPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white font-poppins">
          Fluxo de <span className="text-primary">Caixa</span>
        </h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
          Controle financeiro e lucratividade em tempo real
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/60">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black italic tracking-tighter text-white">R$ 12.450,00</div>
            <div className="flex items-center gap-1 text-primary mt-2">
              <TrendingUp className="size-4" />
              <span className="text-[10px] font-bold">+12% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black italic tracking-tighter text-white">R$ 18.200,00</div>
            <div className="flex items-center gap-1 text-green-500 mt-2">
              <ArrowUpRight className="size-4" />
              <span className="text-[10px] font-bold">45 transações</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-white/40">Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black italic tracking-tighter text-white">R$ 5.750,00</div>
            <div className="flex items-center gap-1 text-secondary mt-2">
              <ArrowDownRight className="size-4" />
              <span className="text-[10px] font-bold">12 contas pagas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5 bg-white/[0.02] overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.01]">
          <CardTitle className="text-sm">Últimas Movimentações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${i % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                    <DollarSign className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Serviço: Troca de Óleo - Honda Civic</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase">12 Abr 2024 • ID: OS-459{i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${i % 2 === 0 ? 'text-primary' : 'text-white'}`}>
                    {i % 2 === 0 ? '+' : '-'} R$ 350,00
                  </p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">PIX</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
