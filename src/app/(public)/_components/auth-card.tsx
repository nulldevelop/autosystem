import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-muted-foreground">{description}</p>
        <div className="mt-7">{children}</div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/auth" className="text-primary hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </main>
  );
}
