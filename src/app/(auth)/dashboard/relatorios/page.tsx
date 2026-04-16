import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, PieChart, TrendingUp, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RelatoriosPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white font-poppins">
            Performance <span className="text-primary">Analytics</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
            Métricas avançadas e inteligência de negócio
          </p>
        </div>
        <Button className="glow-primary">Exportar Relatório Mensal</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ticket Médio", value: "R$ 480", icon: TrendingUp, color: "text-primary" },
          { label: "Novos Clientes", value: "24", icon: Users, color: "text-secondary" },
          { label: "OS Concluídas", value: "156", icon: Target, color: "text-blue-500" },
          { label: "Taxa de Retorno", value: "18%", icon: LineChart, color: "text-purple-500" },
        ].map((item) => (
          <Card key={item.label} className="border-white/5 bg-white/[0.02]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                  <item.icon className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white/40">{item.label}</p>
                  <p className="text-xl font-black text-white">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-white/[0.02] h-80 flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm">Volume de Serviços por Semana</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-end gap-2 px-6 pb-6">
            {[40, 60, 45, 90, 65, 80, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-t-lg relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}%
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.02] h-80">
          <CardHeader>
            <CardTitle className="text-sm">Distribuição de Receita</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { label: "Mecânica", value: 65, color: "bg-primary" },
              { label: "Funilaria", value: 20, color: "bg-secondary" },
              { label: "Elétrica", value: 10, color: "bg-blue-500" },
              { label: "Outros", value: 5, color: "bg-zinc-700" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/60">{item.label}</span>
                  <span className="text-white">{item.value}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} glow-primary shadow-current/20`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
