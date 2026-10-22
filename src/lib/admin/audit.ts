import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "GRANT_FREE_DAYS"
  | "CANCEL_SUBSCRIPTION"
  | "BLOCK_USER"
  | "UNBLOCK_USER";

/** Registra uma ação de administrador. Chamada depois que a ação deu certo. */
export async function writeAudit(input: {
  adminId: string;
  action: AuditAction;
  targetType: "user" | "subscription" | "organization";
  targetId: string;
  details?: Prisma.InputJsonValue;
}) {
  await prisma.adminAuditLog.create({ data: input });
}
