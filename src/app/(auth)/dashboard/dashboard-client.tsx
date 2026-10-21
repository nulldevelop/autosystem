"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateOrganizationForm } from "./_components/create-organization-form";

export default function DashboardClient({
  children,
  hasOrg,
}: {
  children?: React.ReactNode;
  hasOrg?: boolean;
}) {
  const [isCreateOrgModalOpen, setCreateOrgModalOpen] = useState(!hasOrg);
  const searchParams = useSearchParams();
  const forceCreate = searchParams.get("createOrg");
  const error = searchParams.get("error");

  useEffect(() => {
    if (forceCreate === "true" || !hasOrg) {
      setCreateOrgModalOpen(true);
    }
  }, [forceCreate, hasOrg]);

  useEffect(() => {
    if (error === "unauthorized") {
      toast.error("Você não tem permissão para acessar esta página.");
    }
  }, [error]);

  return (
    <>
      {children}

      <CreateOrganizationForm
        open={isCreateOrgModalOpen}
        onOpenChange={setCreateOrgModalOpen}
      />
    </>
  );
}
