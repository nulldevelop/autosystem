"use client";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { CreateOrganizationForm } from "./_components/create-organization-form";

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [isCreateOrgModalOpen, setCreateOrgModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (session?.session?.activeOrganizationId === null) {
      setCreateOrgModalOpen(true);
    }
  }, [session]);

  useEffect(() => {
    if (error === "unauthorized") {
      toast.error("Você não tem permissão para acessar esta página.");
    }
  }, [error]);

  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-5 pb-5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-[0.9] tracking-tighter">
              SEU PAINEL <span className="text-green-500">DE CONTROLE</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
              Bem-vindo ao AutoSystem. Gerencie sua oficina com eficiência.
            </p>
          </motion.div>
        </div>
      </section>

      {children}

      <CreateOrganizationForm
        open={isCreateOrgModalOpen}
        onOpenChange={setCreateOrgModalOpen}
      />
    </>
  );
}
