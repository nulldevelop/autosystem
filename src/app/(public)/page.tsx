"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";

// --- COMPONENTE DE ANIMAÇÃO DE FUNDO ---
const BackgroundAnimation = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Grid Cibernético */}
    <div
      className="absolute inset-0 opacity-[0.1]"
      style={{
        backgroundImage: `linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
      }}
    />

    {/* Esfera de Luz Verde (Topo Esquerda) */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2],
        x: [0, 50, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-20 -left-20 w-150 h-150 bg-green-500/20 blur-[120px] rounded-full"
    />

    {/* Esfera de Luz Laranja (Baixo Direita) */}
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.1, 0.3, 0.1],
        x: [0, -50, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 right-0 w-175 h-175 bg-orange-500/10 blur-[140px] rounded-full"
    />
  </div>
);

export default function LandingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const modules = [
    {
      title: "Orçamentos",
      icon: <ClipboardList />,
      desc: "Gere orçamentos profissionais via WhatsApp em segundos.",
    },
    {
      title: "Financeiro",
      icon: <DollarSign />,
      desc: "Fluxo de caixa, contas a pagar e integração com PIX.",
    },
    {
      title: "Estoque",
      icon: <Package />,
      desc: "Controle de peças com alerta de estoque baixo.",
    },
    {
      title: "Relatórios",
      icon: <BarChart3 />,
      desc: "Dashboard completo com lucratividade e ticket médio.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <BackgroundAnimation />
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/10 backdrop-blur-md">
        <div className="text-2xl font-black tracking-tighter italic">
          AUTO<span className="text-green-500">SYSTEM</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#modulos" className="hover:text-green-500 transition-colors">
            Módulos
          </a>
          <a href="#precos" className="hover:text-orange-500 transition-colors">
            Preços
          </a>
        </div>
        <Link href="/auth">
          <Button
            variant="outline"
            className="hidden md:block border-green-500 text-green-500 hover:bg-green-500 transition-all"
          >
            Acessar Sistema
          </Button>
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <span className="inline-block bg-orange-500/10 text-orange-500 border border-orange-500/20 px-4 py-1 rounded-full font-bold tracking-widest uppercase text-xs italic mb-6">
              Acelere sua Gestão
            </span>
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
              O ÚLTIMO <span className="text-green-500">CHECKUP</span> <br />
              QUE SUA OFICINA PRECISA.
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
              Deixe as planilhas para trás. Controle orçamentos, estoque e
              financeiro em um só lugar com o{" "}
              <span className="text-white font-semibold">AutoSystem</span>.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                Começar agora <ArrowRight className="ml-2" size={18} />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/5 border border-white/10"
              >
                Ver demonstração
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- MÓDULOS --- */}
      <section
        id="modulos"
        className="relative z-10 py-24 bg-zinc-950/50 backdrop-blur-sm border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {modules.map((m, i) => (
              <motion.div
                key={m.title}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-black/40 border border-white/5 hover:border-green-500/50 transition-all group hover:-translate-y-2"
              >
                <div className="p-3 bg-zinc-900 rounded-lg w-fit text-orange-500 mb-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-black transition-all">
                  {m.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{m.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {m.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PREÇOS --- */}
      <section id="precos" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              PLANOS QUE{" "}
              <span className="text-orange-500 italic text-stroke">
                CABEM NO SEU BOLSO
              </span>
            </h2>
            <p className="text-gray-400 mb-10">
              Escolha o plano ideal para a fase atual da sua oficina.
            </p>
          </motion.div>
          {/* Toggle de intervalo de cobrança */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              type="button"
              className={`text-sm font-medium transition-colors ${
                billingInterval === "monthly"
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setBillingInterval("monthly")}
            >
              Mensal
            </button>
            <button
              type="button"
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
              onClick={() =>
                setBillingInterval(
                  billingInterval === "monthly" ? "yearly" : "monthly",
                )
              }
              aria-label="Alternar intervalo de cobrança"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingInterval === "yearly"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
            <button
              type="button"
              className={`text-sm font-medium transition-colors ${
                billingInterval === "yearly"
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
              onClick={() => setBillingInterval("yearly")}
            >
              Anual
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {subscriptionPlans.map((plan, i) => (
              <motion.div
                key={plan.slug}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-3xl flex flex-col h-full transition-all ${
                  plan.slug === "PLUS"
                    ? "bg-green-500 text-black scale-105 relative shadow-[0_0_50px_rgba(34,197,94,0.2)]"
                    : "bg-zinc-900/40 border border-white/10 hover:bg-zinc-900/60"
                }`}
              >
                {(billingInterval === "yearly" ||
                  billingInterval === "monthly") && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-black px-2 py-1 rounded-full uppercase -rotate-12">
                    20% OFF
                  </div>
                )}
                {plan.slug === "PLUS" && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">
                    Mais Vendido
                  </div>
                )}
                <div className="mb-8 text-center">
                  <h3
                    className={`text-xl font-bold mb-4 ${
                      plan.slug === "PLUS"
                        ? "uppercase tracking-tighter"
                        : "text-gray-300"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  {(billingInterval === "yearly" ||
                    billingInterval === "monthly") && (
                    <span className="text-sm text-gray-500 line-through">
                      R${" "}
                      {billingInterval === "yearly"
                        ? (plan.price.yearly * 1.25)
                            .toFixed(2)
                            .replace(".", ",")
                        : (plan.price.monthly * 1.25)
                            .toFixed(2)
                            .replace(".", ",")}
                    </span>
                  )}
                  <div
                    className={`font-black mb-2 ${
                      plan.slug === "PLUS" ? "text-6xl" : "text-5xl"
                    }`}
                  >
                    R${" "}
                    {billingInterval === "yearly"
                      ? (plan.price.yearly / 12).toFixed(2).replace(".", ",")
                      : plan.price.monthly.toFixed(2).replace(".", ",")}
                    <span
                      className={`text-sm font-normal ${
                        plan.slug === "PLUS" ? "opacity-70" : "text-gray-500"
                      }`}
                    >
                      /mês
                    </span>
                  </div>
                  {billingInterval === "yearly" && (
                    <p className="text-xs text-white font-bold mb-2">
                      Total de R${" "}
                      {plan.price.yearly.toFixed(2).replace(".", ",")} cobrado
                      anualmente
                    </p>
                  )}
                  {billingInterval === "yearly" &&
                    plan.price.monthly * 12 - plan.price.yearly > 0 && (
                      <p className="text-xs text-black font-bold mb-6">
                        Economize{" "}
                        {(plan.price.monthly * 12 - plan.price.yearly)
                          .toFixed(2)
                          .replace(".", ",")}{" "}
                        por ano
                      </p>
                    )}
                  <ul
                    className={`text-left space-y-4 ${
                      plan.slug === "PLUS" ? "font-bold" : "text-gray-400"
                    }`}
                  >
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2
                          size={plan.slug === "PLUS" ? 18 : 16}
                          className={
                            plan.slug !== "PLUS" ? "text-green-500" : ""
                          }
                        />{" "}
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  className={`w-full mt-auto ${
                    plan.slug === "PLUS"
                      ? "bg-black text-white hover:bg-zinc-800 py-6 text-lg"
                      : "border-white/20 hover:bg-white hover:text-black"
                  }`}
                  variant={plan.slug === "PLUS" ? "default" : "outline"}
                >
                  {plan.slug === "PROFESSIONAL"
                    ? "Falar com Consultor"
                    : "Assinar Agora"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-16 border-t border-white/10 text-center">
        <div className="text-2xl font-black tracking-tighter italic mb-6">
          AUTO<span className="text-green-500">SYSTEM</span>
        </div>
        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
          Transformando oficinas mecânicas em empresas de alta performance.
        </p>
        <div className="flex justify-center gap-6 text-gray-400 text-xs mb-8">
          <a href="/" className="hover:text-white transition-colors">
            Privacidade
          </a>
          <a href="/" className="hover:text-white transition-colors">
            Termos de Uso
          </a>
          <a href="/" className="hover:text-white transition-colors">
            Suporte
          </a>
        </div>
        <p className="text-zinc-700 text-[10px] uppercase tracking-widest">
          &copy; 2026 NullPHR Software Development. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
