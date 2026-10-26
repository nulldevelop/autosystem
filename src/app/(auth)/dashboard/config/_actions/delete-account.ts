"use server";

import { rm } from "node:fs/promises";
import { join } from "node:path";
import { verifyPassword } from "better-auth/crypto";
import { cancelSubscription } from "@/lib/abacatepay";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

type Result = { success: boolean; message: string };

/**
 * Exclusão definitiva da conta do usuário (LGPD, art. 18, VI).
 *
 * - exige a senha atual (reautenticação), porque a ação é irreversível;
 * - recusa se o usuário é dono de uma oficina com outros membros;
 * - cancela a assinatura na AbacatePay antes de apagar qualquer coisa;
 * - apaga os dados das oficinas em que ele é o único membro, os arquivos
 *   enviados e, por fim, o próprio usuário (sessões, contas e assinatura caem em cascata);
 * - mantém só o histórico de cobranças (BillingEvent), por obrigação fiscal.
 */
export async function deleteAccount(input: {
  password: string;
}): Promise<Result> {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, message: "Não autorizado." };
  }
  const userId = session.user.id;

  const limit = await rateLimit(`delete-account:${userId}`, {
    limit: 5,
    windowSeconds: 15 * 60,
  });
  if (!limit.allowed) {
    return {
      success: false,
      message: "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
    };
  }

  try {
    const credential = await prisma.account.findFirst({
      where: { userId, providerId: "credential" },
      select: { password: true },
    });
    const validPassword =
      !!credential?.password &&
      !!input.password &&
      (await verifyPassword({
        hash: credential.password,
        password: input.password,
      }));
    if (!validPassword) {
      return { success: false, message: "Senha incorreta." };
    }

    const memberships = await prisma.member.findMany({
      where: { userId },
      select: {
        organizationId: true,
        role: true,
        organization: { select: { slug: true, name: true } },
      },
    });

    // oficinas que seriam apagadas junto com a conta: só o usuário é membro
    const ownedOrgs: { id: string; slug: string }[] = [];
    for (const m of memberships) {
      const others = await prisma.member.count({
        where: { organizationId: m.organizationId, userId: { not: userId } },
      });
      if (others === 0) {
        ownedOrgs.push({ id: m.organizationId, slug: m.organization.slug });
      } else if (m.role === "owner") {
        return {
          success: false,
          message: `A oficina "${m.organization.name}" tem outros membros. Remova-os ou transfira a propriedade antes de excluir a conta.`,
        };
      }
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { abacatepaySubscriptionId: true, status: true },
    });
    if (
      subscription?.abacatepaySubscriptionId &&
      subscription.status !== "canceled"
    ) {
      try {
        await cancelSubscription(subscription.abacatepaySubscriptionId);
      } catch (error) {
        console.error("Falha ao cancelar na AbacatePay:", error);
        return {
          success: false,
          message:
            "Não conseguimos cancelar sua assinatura agora. Nada foi excluído; tente de novo em instantes.",
        };
      }
    }

    await prisma.$transaction(
      async (tx) => {
        for (const { id: organizationId } of ownedOrgs) {
          // relações opcionais sem cascata: apagar na ordem das dependências
          await tx.serviceOrder.deleteMany({ where: { organizationId } });
          await tx.budget.deleteMany({ where: { organizationId } });
          await tx.transaction.deleteMany({ where: { organizationId } });
          await tx.product.deleteMany({ where: { organizationId } });
          await tx.vehicle.deleteMany({ where: { organizationId } });
          await tx.customer.deleteMany({ where: { organizationId } });
          await tx.organization.delete({ where: { id: organizationId } });
        }
        await tx.user.delete({ where: { id: userId } });
      },
      { timeout: 60_000 },
    );

    // arquivos só depois do banco: se falhar aqui, o usuário já foi excluído
    for (const { slug } of ownedOrgs) {
      await rm(join(process.cwd(), "storage", slug), {
        recursive: true,
        force: true,
      }).catch((error) =>
        console.error("Falha ao apagar arquivos da oficina:", slug, error),
      );
    }

    return { success: true, message: "Conta excluída." };
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    return {
      success: false,
      message: "Não foi possível excluir a conta. Tente novamente.",
    };
  }
}
