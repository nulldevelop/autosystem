import { notFound } from "next/navigation";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

/**
 * Acesso de administrador.
 *
 * O papel é lido do BANCO a cada chamada (não da sessão em cache) e só pode ser
 * definido direto no banco (scripts/make-admin.mjs). Toda página e toda ação do
 * painel chamam um destes guardas: o layout sozinho não protege server actions.
 */

export type AdminUser = { id: string; email: string; name: string | null };

export class AdminError extends Error {
  constructor(public readonly code: "UNAUTHORIZED" | "FORBIDDEN") {
    super(
      code === "UNAUTHORIZED"
        ? "Você precisa estar autenticado."
        : "Acesso restrito a administradores.",
    );
    this.name = "AdminError";
  }
}

export async function getAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true, blockedAt: true },
  });

  if (!user || user.role !== "admin" || user.blockedAt) return null;
  return { id: user.id, email: user.email, name: user.name };
}

/** Para server actions e rotas: lança AdminError. */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await getSession();
  if (!session?.user) throw new AdminError("UNAUTHORIZED");

  const admin = await getAdmin();
  if (!admin) throw new AdminError("FORBIDDEN");
  return admin;
}

/** Para páginas: quem não é admin vê 404, sem revelar que o painel existe. */
export async function requireAdminPage(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) notFound();
  return admin;
}
