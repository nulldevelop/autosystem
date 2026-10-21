"use client";

import { Building2, Phone, UserPlus, Users } from "lucide-react";
import { StatCard } from "@/components/app/stat-card";
import type { Customer } from "@/generated/prisma/client";

interface CustomerStatsProps {
  customers: Customer[];
}

export function CustomerStats({ customers }: CustomerStatsProps) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const total = customers.length;
  const newThisMonth = customers.filter(
    (c) => new Date(c.createdAt) >= startOfMonth,
  ).length;
  const withPhone = customers.filter((c) => !!c.phone).length;
  const companies = customers.filter((c) => c.documentType === "CNPJ").length;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Clientes"
        value={total}
        hint="Na base"
        icon={Users}
        tone="info"
      />
      <StatCard
        label="Novos no mês"
        value={newThisMonth}
        hint="Cadastrados este mês"
        icon={UserPlus}
        tone="primary"
      />
      <StatCard
        label="Com telefone"
        value={withPhone}
        hint={`${total ? Math.round((withPhone / total) * 100) : 0}% da base`}
        icon={Phone}
        tone="primary"
      />
      <StatCard
        label="Empresas"
        value={companies}
        hint="Clientes com CNPJ"
        icon={Building2}
        tone="neutral"
      />
    </div>
  );
}
