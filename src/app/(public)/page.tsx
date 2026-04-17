"use client";

import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  Gauge,
  HeadphonesIcon,
  Package,
  Quote,
  Shield,
  Star,
  Truck,
  Users,
  Video,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";

const BackgroundAnimation = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }}
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/30 blur-[150px] rounded-full"
    />
    <motion.div
      animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1], x: [0, -30, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/20 blur-[160px] rounded-full"
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-10" />
  </div>
);

const testimonials = [
  {
    name: "Roberto Silva",
    role: "Dono - Auto Centro São Paulo",
    text: "Em 3 meses, aumentamos nosso faturamento em 40%. O sistema é intuitivo e nossa equipe adorou.",
    avatar: "RS",
    rating: 5,
  },
  {
    name: "Juliana Mendes",
    role: "Gerente - Mega Motors",
    text: "O controle de estoque me ahorrou R$ 5k por mês em peças perdidas. Imperdível!",
    avatar: "JM",
    rating: 5,
  },
  {
    name: "Carlos Eduardo",
    role: "Proprietário - Fast Fix",
    text: "Melhor investimento que fizemos. O app mobile é show, gravo OS direto na oficina.",
    avatar: "CE",
    rating: 5,
  },
];

const trustBadges = [
  { icon: Shield, text: "Dados Criptografados" },
  { icon: HeadphonesIcon, text: "Suporte 24/7" },
  { icon: Zap, text: "99.9% Uptime" },
  { icon: Truck, text: "Deploy em 5	min" },
];

const features = [
  {
    title: "Orçamento Inteligente",
    desc: "Crie orçamentos em 30 segundos. O cliente recebe via WhatsApp e approve com um tap.",
    icon: ClipboardList,
    stats: "-70% tempo",
  },
  {
    title: "Controle Total de Estoque",
    desc: "Alertas automáticos quando o estoque baixa. Nunca mais falta peça importante.",
    icon: Package,
    stats: "-5k/mês",
  },
  {
    title: "Financeiro 360°",
    desc: "Fluxo de caixa, ticket médio, lucratividade por serviço. Tudo em tempo real.",
    icon: DollarSign,
    stats: "100% visível",
  },
  {
    title: "Gestão de Clientes CRM",
    desc: "Histórico completo, lembretes de revisão, marketing automático.",
    icon: Users,
    stats: "+30% retornos",
  },
  {
    title: "App Mobile Offline",
    desc: "Trabalhe sem internet. dados sincroniza quando conectar.",
    icon: Zap,
    stats: "Always-on",
  },
  {
    title: "Relatórios Estratégicos",
    desc: "Métricas que importam.ROI, ticket médio, лучший clientes.",
    icon: BarChart3,
    stats: "Data-driven",
  },
];

export default function LandingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const fadeIn = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 },
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 selection:text-white overflow-x-hidden font-sans">
      <BackgroundAnimation />

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-4 mx-auto max-w-7xl border-b border-white/5 backdrop-blur-xl sticky top-0 bg-black/50">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
          <div className="hidden md:flex flex-col leading-none">
            <span className="text-xl font-black italic tracking-tighter text-white">
              AUTO<span className="text-primary">SYSTEM</span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-wider text-white/40">
          <a href="#features" className="hover:text-primary transition-colors">
            Recursos
          </a>
          <a
            href="#depoimentos"
            className="hover:text-primary transition-colors"
          >
            Depoimentos
          </a>
          <a href="#precos" className="hover:text-secondary transition-colors">
            Planos
          </a>
        </div>

        <div className="flex gap-3">
          <Link href="/auth">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              Entrar
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Começar Grátis
            </Button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-24 pb-32">
        <div className="mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-5 py-2 rounded-full font-bold tracking-widest uppercase text-xs mb-8">
                <Zap size={14} /> #1 Sistema para Oficinas
              </span>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tighter italic font-poppins">
                Sua Oficina <br />
                <span className="text-primary">Não Pode Ficar</span> <br />
                <span className="text-secondary">Fora do Ar.</span>
              </h1>

              <p className="text-xl md:text-2xl text-white/50 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                Mais de{" "}
                <span className="text-primary font-bold">1.500 oficinas</span>{" "}
                confiam no AutoSystem para gestão completa: orçamentos, estoque,
                financeiro e muito mais.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/auth">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-12 h-16 text-lg bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                  >
                    Criar Conta Grátis <ArrowRight className="ml-3" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto px-12 h-16 text-lg border-white/10 bg-white/5"
                  >
                    <Video className="mr-3" /> Ver Demonstração
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                {trustBadges.map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-white/30 text-sm font-medium"
                  >
                    <badge.icon size={18} className="text-primary" />
                    {badge.text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="relative mt-16"
          >
            <div className="glass rounded-3xl p-2 md:p-4 border-white/10 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-[#050505] rounded-2xl overflow-hidden border border-white/5 relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.01),rgba(0,0,255,0.01))] bg-size-[100%_4px,4px_100%] pointer-events-none z-10" />

                {/* Fake Dashboard Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="size-3 rounded-full bg-red-500/60" />
                    <div className="size-3 rounded-full bg-yellow-500/60" />
                    <div className="size-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">
                      AutoSystem
                    </span>
                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>

                {/* Fake Dashboard Content */}
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Faturamento Hoje",
                      value: "R$ 12.450",
                      trend: "+12%",
                      color: "primary",
                    },
                    {
                      label: "Ordens Abertas",
                      value: "8",
                      trend: "3",
                      color: "blue",
                    },
                    {
                      label: "Clientes",
                      value: "1.247",
                      trend: "+5",
                      color: "secondary",
                    },
                    {
                      label: "Estoque Baixo",
                      value: "3 itens",
                      trend: "Alerta",
                      color: "red",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-white/[0.02] rounded-xl p-4 border border-white/5"
                    >
                      <p className="text-[10px] font-bold text-white/30 uppercase mb-2">
                        {stat.label}
                      </p>
                      <div className="flex items-end justify-between">
                        <span className="text-xl font-black italic">
                          {stat.value}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${stat.color === "primary" ? "text-green-400" : stat.color === "red" ? "text-red-400" : "text-white/50"}`}
                        >
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fake Chart */}
                <div className="px-6 pb-6">
                  <div className="h-32 flex items-end gap-2 px-4">
                    {[35, 45, 30, 55, 70, 50, 80, 65, 90, 75, 85, 95].map(
                      (h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.05, duration: 0.5 }}
                          className="flex-1 bg-gradient-to-t from-primary/60 to-primary/20 rounded-t-sm"
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- DEPOIMENTOS --- */}
      <section id="depoimentos" className="relative z-10 py-24 bg-white/[0.02]">
        <div className="mx-auto px-6 max-w-7xl">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 font-poppins">
              O que <span className="text-primary">Donos de Oficina</span>
              <br />
              Falam sobre nós
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-8 border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      className="fill-secondary text-secondary"
                    />
                  ))}
                </div>
                <p className="text-lg text-white/70 mb-6 leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-black text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="relative z-10 py-32">
        <div className="mx-auto px-6 max-w-7xl">
          <motion.div {...fadeIn} className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 font-poppins">
              Tudo que sua oficina <span className="text-primary">Precisa</span>
              ,<br />
              em um só lugar.
            </h2>
            <p className="text-white/40 text-xl max-w-2xl mx-auto">
              Semplanilhas, semcaos. Um sistema feito para oficсей que querem
              crecer.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="group glass rounded-2xl p-8 border-white/5 hover:border-primary/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 rounded-xl bg-white/5 text-primary group-hover:scale-110 transition-transform">
                    <f.icon size={28} />
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {f.stats}
                  </span>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-3">
                  {f.title}
                </h3>
                <p className="text-white/40 font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="relative z-10 py-32">
        <div className="mx-auto px-6 max-w-4xl">
          <div className="glass rounded-[3rem] p-12 md:p-20 text-center border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/20 blur-[120px] rounded-full" />

            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 relative z-10">
              Comece <span className="text-primary">HOJE</span>
              <br />
              Não Esqueça Mais de Nada.
            </h2>

            <p className="text-xl text-white/50 mb-10 relative z-10 max-w-xl mx-auto">
              14 dias de teste gratuito, sem cartão. Cancelamento quando quiser.
            </p>

            <Link href="/auth" className="relative z-10 inline-block">
              <Button
                size="lg"
                className="h-18 px-16 text-xl bg-primary hover:bg-primary/90 shadow-[0_0_40px_rgba(34,197,94,0.4)]"
              >
                Criar Conta Grátis <ArrowRight className="ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-16 border-t border-white/5 text-center">
        <div className="mx-auto px-6 max-w-7xl">
          <Logo className="mb-8" />
          <div className="flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-wider text-white/30 mb-8">
            <a href="#" className="hover:text-white transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Termos
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contato
            </a>
          </div>
          <p className="text-white/15 text-xs uppercase tracking-widest">
            © 2026 AutoSystem. Feito com ⚡ para Oficinas.
          </p>
        </div>
      </footer>
    </div>
  );
}
