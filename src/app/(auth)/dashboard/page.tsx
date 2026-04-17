import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <h1 className="text-4xl font-black italic">
        SEU PAINEL <span className="text-primary">DE CONTROLE</span>
      </h1>
      <p className="text-white/40 mt-4">Sistema carregado!</p>
    </div>
  );
}
