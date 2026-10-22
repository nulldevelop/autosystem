import { randomBytes } from "node:crypto";
import { addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";

export const REFERRAL_REWARD_MONTHS = 2;

function generateCode() {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function getOrCreateReferralCode(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user?.referralCode) return user.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: generateCode() },
        select: { referralCode: true },
      });
      return updated.referralCode as string;
    } catch {
      // colisão no @unique: tenta outro código
    }
  }
  throw new Error("Não foi possível gerar o código de indicação");
}

/** Vincula o novo usuário a quem o indicou. Ignora códigos inválidos. */
export async function attachReferrer(newUserEmail: string, code: string) {
  const referrer = await prisma.user.findUnique({
    where: { referralCode: code.trim().toUpperCase() },
    select: { id: true },
  });
  if (!referrer) return;

  await prisma.user.updateMany({
    where: { email: newUserEmail, id: { not: referrer.id }, referredById: null },
    data: { referredById: referrer.id },
  });
}

/**
 * Chamado quando o indicado conclui o primeiro pagamento.
 * Concede REFERRAL_REWARD_MONTHS ao indicador, uma única vez por indicado.
 */
export async function rewardReferrerForFirstPayment(referredUserId: string) {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: referredUserId },
      select: { referredById: true },
    });
    if (!user?.referredById) return;

    // updateMany com referralRewardedAt: null garante idempotência (webhook repetido)
    const claimed = await tx.user.updateMany({
      where: { id: referredUserId, referralRewardedAt: null },
      data: { referralRewardedAt: new Date() },
    });
    if (claimed.count === 0) return;

    const now = new Date();
    const current = await tx.subscription.findUnique({
      where: { userId: user.referredById },
      select: { bonusUntil: true },
    });
    const base =
      current?.bonusUntil && current.bonusUntil > now ? current.bonusUntil : now;
    const bonusUntil = addMonths(base, REFERRAL_REWARD_MONTHS);

    await tx.subscription.upsert({
      where: { userId: user.referredById },
      create: { userId: user.referredById, bonusUntil },
      update: { bonusUntil },
    });
  });
}

export async function getReferralStats(userId: string) {
  const [invited, rewarded] = await Promise.all([
    prisma.user.count({ where: { referredById: userId } }),
    prisma.user.count({
      where: { referredById: userId, referralRewardedAt: { not: null } },
    }),
  ]);
  return { invited, rewarded, monthsEarned: rewarded * REFERRAL_REWARD_MONTHS };
}
