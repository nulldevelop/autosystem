import { PlanCards } from "./plan-cars";

export default function PlansPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Planos de Assinatura
        </h1>
        <p className="text-gray-400 text-sm">
          Escolha o plano que melhor se adapta às suas necessidades
        </p>
      </div>
      <PlanCards />
    </div>
  );
}
