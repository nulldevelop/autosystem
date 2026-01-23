"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { BackgroundAnimation } from "@/utils/backgroud";
import { CreateOrganizationForm } from "./_components/create-organization-form";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [isCreateOrgModalOpen, setCreateOrgModalOpen] = useState(false);

  useEffect(() => {
    if (session?.session?.activeOrganizationId === null) {
      setCreateOrgModalOpen(true);
    }
  }, [session]);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <BackgroundAnimation />

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-12 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
              SEU PAINEL <span className="text-green-500">DE CONTROLE</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
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
