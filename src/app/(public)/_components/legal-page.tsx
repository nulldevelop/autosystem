import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { company, companyAddressLine } from "@/config/company";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background p-4 text-foreground sm:p-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button
          asChild
          variant="ghost"
          className="mb-4 pl-0 text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Última atualização: {company.legalUpdatedAt}
        </p>

        <section className="space-y-4 leading-relaxed text-muted-foreground [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </section>

        <footer className="border-t pt-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{company.legalName}</p>
          <p>
            {company.brand} · CNPJ {company.cnpj}
          </p>
          <p>{companyAddressLine}</p>
          <p>
            Contato:{" "}
            <a
              href={`mailto:${company.email}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {company.email}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
