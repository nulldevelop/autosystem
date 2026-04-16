"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Package,
  Wrench,
  Star,
  TrendingUp,
  Send,
  Zap,
  ChevronRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";
import { Logo } from "@/components/ui/logo";

// --- COMPONENTE DE ANIMAÇÃO DE FUNDO ---
const BackgroundAnimation = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    {/* Grid Cibernético */}
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: `linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
      }}
    />

    {/* Speed Lines */}
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <div className="absolute top-1/4 -left-20 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent rotate-12 blur-[1px]" />
      <div className="absolute top-2/4 -left-20 w-full h-[1px] bg-gradient-to-r from-transparent via-secondary to-transparent -rotate-6 blur-[1px]" />
    </div>

    {/* Esferas de Luz */}
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], x: [0, 50, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-20 -left-20 w-150 h-150 bg-primary/20 blur-[120px] rounded-full"
    />
    <motion.div
      animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05], x: [0, -50, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 right-0 w-175 h-175 bg-secondary/10 blur-[140px] rounded-full"
    />
  </div>
);

export default function LandingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 selection:text-white overflow-x-hidden font-sans">
      <BackgroundAnimation />
      
      {/* --- NAVBAR --- */}
      <nav className="relative z-50 flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3">
          <Logo />
          <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
          <div className="hidden md:flex flex-col leading-none">
            <span className="text-xl font-black italic tracking-tighter text-white">
              AUTO<span className="text-primary">SYSTEM</span>
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          <a href="#modulos" className="hover:text-primary transition-colors">Módulos</a>
          <a href="#metrics" className="hover:text-primary transition-colors">Performance</a>
          <a href="#precos" className="hover:text-secondary transition-colors">Preços</a>
        </div>
        
        <Link href="/auth">
          <Button variant="tech" size="sm" className="hidden md:flex">
            Acessar Sistema
          </Button>
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-32 pb-40">
        <div className="max-w-7xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-[10px] mb-8 animate-pulse">
                <Zap size={12} /> Engenharia de Gestão Automotiva
              </span>
              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.85] tracking-tighter italic font-poppins">
                Sua Oficina <br />
                <span className="text-primary">Sem Limites.</span>
              </h1>
              <p className="text-xl text-white/40 mb-10 max-w-xl leading-relaxed font-medium">
                Abandone as planilhas. Assuma o controle total do seu negócio com a plataforma de alta performance feita para quem entende de velocidade.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link href="/auth">
                  <Button size="lg" className="px-10 h-14 text-lg">
                    Começar Agora <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-10 h-14 text-lg border-white/5 bg-white/5">
                  Ver Demo
                </Button>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 relative hidden lg:block"
          >
            <div className="relative z-10 glass rounded-[2rem] p-3 border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
              <div className="bg-[#050505] rounded-[1.5rem] overflow-hidden aspect-[4/3] border border-white/5 relative p-6">
                {/* Top Bar Mockup */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex gap-2">
                    <div className="size-2 rounded-full bg-red-500/50" />
                    <div className="size-2 rounded-full bg-orange-500/50" />
                    <div className="size-2 rounded-full bg-green-500/50" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Live Telemetry</span>
                  </div>
                </div>

                {/* Main Stats Mockup */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase mb-2">Performance Index</p>
                    <div className="text-2xl font-black italic text-primary">98.4%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase mb-2">Monthly ROI</p>
                    <div className="text-2xl font-black italic text-secondary">+R$ 12k</div>
                  </div>
                </div>

                {/* Chart Mockup */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-end gap-1.5 h-24 px-2">
                    {[40, 70, 45, 90, 65, 80, 50, 95, 60, 75].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 1 + (i * 0.1), duration: 1 }}
                        className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-sm"
                      />
                    ))}
                  </div>
                  <div className="h-[1px] w-full bg-white/5" />
                </div>

                {/* Bottom HUD */}
                <div className="flex items-center justify-between mt-auto">
                   <div className="flex gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[6px] font-black text-white/20 uppercase">Core Status</span>
                        <span className="text-[8px] font-black text-primary uppercase">Optimized</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[6px] font-black text-white/20 uppercase">Database</span>
                        <span className="text-[8px] font-black text-white/60 uppercase">Synced</span>
                      </div>
                   </div>
                   <div className="size-10 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center relative">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-t-primary border-transparent"
                      />
                      <Zap size={12} className="text-primary" />
                   </div>
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] z-20" />
              </div>
            </div>
            
            {/* Background Glows for Mockup */}
            <div className="absolute -top-10 -right-10 size-64 bg-primary/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-10 -left-10 size-64 bg-secondary/10 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* --- MÉTRICAS (PIT STOP) --- */}
      <section id="metrics" className="relative z-10 py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { label: "Orçamentos/mês", value: "50k+", icon: ClipboardList },
              { label: "Aumento de Lucro", value: "35%", icon: TrendingUp },
              { label: "Satisfação", value: "99%", icon: Star },
            ].map((m, i) => (
              <motion.div 
                key={i} 
                {...fadeIn} 
                transition={{ delay: i * 0.1 }}
                className="text-center space-y-2"
              >
                <div className="flex items-center gap-2 justify-center">
                  <m.icon className="size-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{m.label}</span>
                </div>
                <div className="text-5xl md:text-6xl font-black italic tracking-tighter font-poppins">{m.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MÓDULOS --- */}
      <section id="modulos" className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 font-poppins">
                Módulos de <span className="text-primary">Precisão</span>
              </h2>
              <p className="text-white/40 text-lg font-medium">
                Cada funcionalidade foi desenhada para eliminar gargalos e acelerar o fluxo de trabalho da sua equipe.
              </p>
            </div>
            <a href="#precos">
              <Button variant="link" className="group">
                Explorar Todas <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Smart Budget",
                desc: "Orçamentos digitais gerados em segundos com envio direto para o WhatsApp do cliente.",
                icon: <Send className="size-6" />,
                color: "primary"
              },
              {
                title: "Stock Control",
                desc: "Gestão inteligente de peças com alertas de estoque baixo e sugestão de compra.",
                icon: <Package className="size-6" />,
                color: "primary"
              },
              {
                title: "Financial HUD",
                desc: "Visão 360 do seu fluxo de caixa, lucratividade por serviço e ticket médio.",
                icon: <DollarSign className="size-6" />,
                color: "secondary"
              },
            ].map((m, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="p-10 rounded-3xl glass border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-8 group-hover:scale-110 transition-transform ${m.color === 'secondary' ? 'text-secondary' : 'text-primary'}`}>
                  {m.icon}
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 font-poppins">{m.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-6 font-medium">{m.desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-primary transition-colors">
                  Configurar Módulo <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PREÇOS --- */}
      <section id="precos" className="relative z-10 py-32 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 font-poppins">
              Planos de <span className="text-secondary">Aceleração</span>
            </h2>
            <p className="text-white/40 mb-12 font-medium">
              Escolha o combustível ideal para a fase atual da sua oficina.
            </p>
          </motion.div>
          
          <div className="flex items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`text-[10px] font-black uppercase tracking-widest transition-all ${billingInterval === "monthly" ? "text-primary" : "text-white/30"}`}
            >
              Faturamento Mensal
            </button>
            <div 
              onClick={() => setBillingInterval(billingInterval === "monthly" ? "yearly" : "monthly")}
              className="w-12 h-6 rounded-full bg-white/10 border border-white/10 relative cursor-pointer"
            >
              <motion.div 
                animate={{ x: billingInterval === "monthly" ? 4 : 24 }}
                className="absolute top-1 size-4 rounded-full bg-primary"
              />
            </div>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={`text-[10px] font-black uppercase tracking-widest transition-all ${billingInterval === "yearly" ? "text-primary" : "text-white/30"}`}
            >
              Faturamento Anual <span className="text-secondary">(-20%)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {subscriptionPlans.map((plan, i) => (
              <motion.div
                key={plan.slug}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-[2.5rem] flex flex-col h-full transition-all relative overflow-hidden ${
                  plan.slug === "PLUS"
                    ? "glass border-primary/30 scale-105 z-20 shadow-[0_0_50px_rgba(34,197,94,0.1)]"
                    : "glass border-white/5 opacity-80 hover:opacity-100"
                }`}
              >
                {billingInterval === "yearly" && (
                  <div className="absolute top-6 right-6 bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase -rotate-12 z-30">
                    20% OFF
                  </div>
                )}
                
                <div className="mb-10 text-left">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter mb-4 text-white/50">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black italic tracking-tighter font-poppins">R$</span>
                    <span className="text-7xl font-black italic tracking-tighter font-poppins">
                      {billingInterval === "yearly"
                        ? (plan.price.yearly / 12).toFixed(0)
                        : plan.price.monthly.toFixed(0)}
                    </span>
                    <span className="text-white/30 text-sm font-black uppercase">/mês</span>
                  </div>
                </div>

                <ul className="text-left space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-bold text-white/40">
                      <CheckCircle2 size={16} className="text-primary shrink-0" /> {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.slug === "PLUS" ? "default" : "outline"}
                  className="w-full h-14 text-md"
                >
                  {plan.slug === "PROFESSIONAL" ? "Falar com Consultor" : "Assinar Agora"}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="relative z-10 py-40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="glass rounded-[3rem] p-16 text-center border-primary/20 bg-primary/5 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 size-80 bg-primary/10 blur-[100px] rounded-full" />
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-8 font-poppins relative z-10">
              PRONTO PARA <br />
              <span className="text-primary">VENCER A CORRIDA?</span>
            </h2>
            <p className="text-xl text-white/40 mb-12 font-medium relative z-10">
              Junte-se a mais de 1.200 oficinas que transformaram sua gestão com o AutoSystem.
            </p>
            <Link href="/auth">
              <Button size="lg" className="h-16 px-16 text-xl relative z-10">
                Iniciar Teste Gratuito
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 py-20 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <Logo className="mb-10 scale-125" />
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-12">
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
            <a href="#" className="hover:text-white transition-colors">WhatsApp</a>
          </div>
          <p className="text-white/10 text-[9px] uppercase tracking-widest">
            &copy; 2026 AUTO SYSTEM PERFORMANCE ERP. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
