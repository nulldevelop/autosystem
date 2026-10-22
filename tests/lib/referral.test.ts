import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));

import {
  REFERRAL_REWARD_MONTHS,
  attachReferrer,
  getOrCreateReferralCode,
  getReferralStats,
  rewardReferrerForFirstPayment,
} from "@/lib/referral";

const NOW = new Date("2026-10-22T12:00:00.000Z");

beforeEach(() => {
  resetPrismaMock();
});

describe("getOrCreateReferralCode", () => {
  it("devolve o código existente sem gravar nada", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ referralCode: "ABC123" });

    await expect(getOrCreateReferralCode("u1")).resolves.toBe("ABC123");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("gera um código hexadecimal de 10 caracteres em maiúsculas", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ referralCode: null });
    prismaMock.user.update.mockImplementation(async ({ data }) => ({
      referralCode: data.referralCode,
    }));

    const code = await getOrCreateReferralCode("u1");

    expect(code).toMatch(/^[0-9A-F]{10}$/);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1" } }),
    );
  });

  it("tenta de novo quando o código colide", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.update
      .mockRejectedValueOnce(new Error("unique"))
      .mockResolvedValueOnce({ referralCode: "NOVOCODE" });

    await expect(getOrCreateReferralCode("u1")).resolves.toBe("NOVOCODE");
    expect(prismaMock.user.update).toHaveBeenCalledTimes(2);
  });

  it("desiste depois de 5 colisões", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.update.mockRejectedValue(new Error("unique"));

    await expect(getOrCreateReferralCode("u1")).rejects.toThrow(
      "Não foi possível gerar o código de indicação",
    );
    expect(prismaMock.user.update).toHaveBeenCalledTimes(5);
  });
});

describe("attachReferrer", () => {
  it("ignora código inexistente", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await attachReferrer("novo@example.com", "xxxx");

    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });

  it("normaliza o código e vincula o indicador", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "referrer" });

    await attachReferrer("novo@example.com", "  abc123 ");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { referralCode: "ABC123" },
      select: { id: true },
    });
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: {
        email: "novo@example.com",
        id: { not: "referrer" },
        referredById: null,
      },
      data: { referredById: "referrer" },
    });
  });

  it("não deixa o usuário indicar a si mesmo nem trocar de indicador", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "referrer" });

    await attachReferrer("novo@example.com", "ABC");

    const { where } = prismaMock.user.updateMany.mock.calls[0][0];
    expect(where.id).toEqual({ not: "referrer" });
    expect(where.referredById).toBeNull();
  });
});

describe("rewardReferrerForFirstPayment", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("não faz nada se o usuário não foi indicado", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ referredById: null });

    await rewardReferrerForFirstPayment("u2");

    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
  });

  it("não faz nada se o usuário não existe", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await rewardReferrerForFirstPayment("fantasma");

    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
  });

  it("é idempotente: um segundo webhook não paga de novo", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ referredById: "referrer" });
    prismaMock.user.updateMany.mockResolvedValue({ count: 0 });

    await rewardReferrerForFirstPayment("u2");

    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
  });

  it("dá 2 meses a partir de hoje a quem não tinha bônus", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ referredById: "referrer" });
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.subscription.findUnique.mockResolvedValue(null);

    await rewardReferrerForFirstPayment("u2");

    const expected = new Date("2026-12-22T12:00:00.000Z");
    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith({
      where: { userId: "referrer" },
      create: { userId: "referrer", bonusUntil: expected },
      update: { bonusUntil: expected },
    });
    expect(REFERRAL_REWARD_MONTHS).toBe(2);
  });

  it("soma os meses quando o indicador ainda tem bônus", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ referredById: "referrer" });
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.subscription.findUnique.mockResolvedValue({
      bonusUntil: new Date("2026-11-22T12:00:00.000Z"),
    });

    await rewardReferrerForFirstPayment("u2");

    const expected = new Date("2027-01-22T12:00:00.000Z");
    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { bonusUntil: expected } }),
    );
  });

  it("recomeça de hoje quando o bônus antigo já venceu", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ referredById: "referrer" });
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.subscription.findUnique.mockResolvedValue({
      bonusUntil: new Date("2026-01-01T00:00:00.000Z"),
    });

    await rewardReferrerForFirstPayment("u2");

    const expected = new Date("2026-12-22T12:00:00.000Z");
    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: { bonusUntil: expected } }),
    );
  });

  it("marca o indicado como recompensado dentro da transação", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ referredById: "referrer" });
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.subscription.findUnique.mockResolvedValue(null);

    await rewardReferrerForFirstPayment("u2");

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.updateMany).toHaveBeenCalledWith({
      where: { id: "u2", referralRewardedAt: null },
      data: { referralRewardedAt: NOW },
    });
  });
});

describe("getReferralStats", () => {
  it("calcula convidados, pagantes e meses ganhos", async () => {
    prismaMock.user.count.mockResolvedValueOnce(5).mockResolvedValueOnce(3);

    await expect(getReferralStats("u1")).resolves.toEqual({
      invited: 5,
      rewarded: 3,
      monthsEarned: 6,
    });
  });

  it("zera tudo para quem não indicou ninguém", async () => {
    prismaMock.user.count.mockResolvedValue(0);

    await expect(getReferralStats("u1")).resolves.toEqual({
      invited: 0,
      rewarded: 0,
      monthsEarned: 0,
    });
  });
});
