"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cancelSubscription } from "@/lib/abacatepay";
import { writeAudit } from "@/lib/admin/audit";
import { AdminError, requireAdmin } from "@/lib/admin/guard";
import { prisma } from "@/lib/prisma";

// Toda ação começa por requireAdmin(): o papel é conferido no banco a cada chamada,
// porque um server action pode ser chamado diretamente, sem passar pelo layout.

type Result = { success: boolean; message: string };

function failure(error: unknown, fallback: string): Result {
  if (error instanceof AdminError) {
    return { success: false, message: error.message };
  }
  console.error(fallback, error);
  return { success: false, message: fallback };
}

function refresh() {
  for (const path of [
    "/admin",
    "/admin/usuarios",
    "/admin/assinaturas",
    "/admin/oficinas",
    "/admin/auditoria",
  ]) {
    revalidatePath(path);
  }
}

const grantSchema = z.object({
  userId: z.string().min(1),
  days: z.coerce.number().int().min(1).max(365),
});

/** Dá dias de acesso grátis (soma ao bônus já existente). */
export async function grantFreeDays(input: unknown): Promise<Result> {
  try {
    const admin = await requireAdmin();

    const parsed = grantSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: "Informe de 1 a 365 dias." };
    }
    const { userId, days } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) return { success: false, message: "Usuário não encontrado." };

    const current = await prisma.subscription.findUnique({
      where: { userId },
      select: { bonusUntil: true },
    });
    const now = new Date();
    const base =
      current?.bonusUntil && current.bonusUntil > now ? current.bonusUntil : now;
    const bonusUntil = addDays(base, days);

    await prisma.subscription.upsert({
      where: { userId },
      create: { userId, bonusUntil },
      update: { bonusUntil },
    });

    await writeAudit({
      adminId: admin.id,
      action: "GRANT_FREE_DAYS",
      targetType: "user",
      targetId: userId,
      details: { days, bonusUntil: bonusUntil.toISOString() },
    });

    refresh();
    return {
      success: true,
      message: `${days} dia(s) grátis concedidos a ${user.email}.`,
    };
  } catch (error) {
    return failure(error, "Não foi possível conceder os dias grátis.");
  }
}

const userIdSchema = z.object({ userId: z.string().min(1) });

/** Cancela a assinatura ativa na AbacatePay e no sistema. */
export async function cancelUserSubscription(input: unknown): Promise<Result> {
  try {
    const admin = await requireAdmin();

    const parsed = userIdSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: "Dados inválidos." };
    const { userId } = parsed.data;

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    if (!subscription || subscription.status !== "active") {
      return {
        success: false,
        message: "Este usuário não tem assinatura ativa.",
      };
    }

    // Se o cancelamento na AbacatePay falhar, nada é alterado aqui (evita cobrar sem acesso)
    if (subscription.abacatepaySubscriptionId) {
      try {
        await cancelSubscription(subscription.abacatepaySubscriptionId);
      } catch (error) {
        console.error("Falha ao cancelar na AbacatePay:", error);
        return {
          success: false,
          message: "A AbacatePay não confirmou o cancelamento. Tente de novo.",
        };
      }
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "canceled" },
    });

    await writeAudit({
      adminId: admin.id,
      action: "CANCEL_SUBSCRIPTION",
      targetType: "subscription",
      targetId: subscription.id,
      details: {
        userId,
        plan: subscription.plan,
        abacatepaySubscriptionId: subscription.abacatepaySubscriptionId,
      },
    });

    refresh();
    return { success: true, message: "Assinatura cancelada." };
  } catch (error) {
    return failure(error, "Não foi possível cancelar a assinatura.");
  }
}

const blockSchema = z.object({
  userId: z.string().min(1),
  blocked: z.boolean(),
});

/** Bloqueia ou desbloqueia uma conta. Bloquear encerra as sessões abertas. */
export async function setUserBlocked(input: unknown): Promise<Result> {
  try {
    const admin = await requireAdmin();

    const parsed = blockSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: "Dados inválidos." };
    const { userId, blocked } = parsed.data;

    if (userId === admin.id) {
      return { success: false, message: "Você não pode bloquear a si mesmo." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });
    if (!user) return { success: false, message: "Usuário não encontrado." };
    if (user.role === "admin") {
      return {
        success: false,
        message: "Administradores não podem ser bloqueados pelo painel.",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { blockedAt: blocked ? new Date() : null },
    });
    if (blocked) {
      await prisma.session.deleteMany({ where: { userId } });
    }

    await writeAudit({
      adminId: admin.id,
      action: blocked ? "BLOCK_USER" : "UNBLOCK_USER",
      targetType: "user",
      targetId: userId,
      details: { email: user.email },
    });

    refresh();
    return {
      success: true,
      message: blocked
        ? `${user.email} foi bloqueado e desconectado.`
        : `${user.email} foi desbloqueado.`,
    };
  } catch (error) {
    return failure(error, "Não foi possível atualizar o bloqueio.");
  }
}
