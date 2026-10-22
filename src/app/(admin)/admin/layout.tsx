import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { requireAdminPage } from "@/lib/admin/guard";
import { AdminNav } from "./_components/admin-nav";

export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

// Nunca cacheado: o acesso depende do papel atual no banco
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdminPage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden />
            <span className="truncate text-base font-semibold tracking-tight">
              Painel administrativo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {admin.email}
            </span>
            <Link
              href="/dashboard"
              className="text-sm text-primary hover:underline"
            >
              Voltar ao app
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 pb-12 sm:px-6 sm:py-6">
        {children}
      </main>
    </div>
  );
}
