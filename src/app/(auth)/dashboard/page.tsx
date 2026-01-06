"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { CreateOrganizationForm } from "./_components/create-organization-form";

const BackgroundAnimation = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0 opacity-[0.2]" // Increased opacity slightly for visibility on light background
      style={{
        backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`, // Light gray grid
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, white, transparent 80%)", // Mask with white for light background
      }}
    />

    {/* Esfera de Luz Verde (Topo Esquerda) */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.2, 0.1], // Reduced opacity
        x: [0, 50, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-20 -left-20 w-150 h-150 bg-green-500/10 blur-[100px] rounded-full" // Reduced blur and opacity
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.05, 0.15, 0.05], // Reduced opacity
        x: [0, -50, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 right-0 w-175 h-175 bg-orange-500/5 blur-[120px] rounded-full" // Reduced blur and opacity
    />
  </div>
); // CLOSING PARENTHESIS ADDED

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isCreateOrgModalOpen, setCreateOrgModalOpen] = useState(false);

  useEffect(() => {
    if (session?.session?.activeOrganizationId === null) {
      setCreateOrgModalOpen(true);
    }
  }, [session]);

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900 selection:bg-green-500 selection:text-white overflow-x-hidden">
      <BackgroundAnimation />
      <div className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto border-b border-white/10 backdrop-blur-md">
        <div className="text-2xl font-black tracking-tighter italic text-gray-900">
          AUTO<span className="text-green-500">SYSTEM</span>
        </div>
        <Button
          variant="outline"
          className="hidden md:block border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
        >
          Sair
        </Button>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-gray-900">
              SEU PAINEL <span className="text-green-500">DE CONTROLE</span>
            </h1>
            <p className="text-xl text-gray-700 mb-10 max-w-xl leading-relaxed">
              Bem-vindo ao AutoSystem. Gerencie sua oficina com eficiência.
            </p>
          </motion.div>
        </div>
      </section>

      <CreateOrganizationForm
        open={isCreateOrgModalOpen}
        onOpenChange={setCreateOrgModalOpen}
      />
    </div>
  );
}
