import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTrialStart, resolveAccess } from "@/utils/permissions/access";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const daysFromNow = (days: number) =>
  new Date(NOW.getTime() + days * 24 * 60 * 60 * 1000);

type Sub = Parameters<typeof resolveAccess>[1];
const sub = (overrides: Partial<NonNullable<Sub>> = {}): NonNullable<Sub> => ({
  plan: "BASIC",
  status: null,
  currentPeriodEnd: null,
  bonusUntil: null,
  abacatepaySubscriptionId: null,
  ...overrides,
});

describe("getTrialStart", () => {
  it("usa createdAt quando o e-mail ainda não foi confirmado", () => {
    const createdAt = new Date("2026-10-01T00:00:00.000Z");
    expect(getTrialStart({ createdAt })).toEqual(createdAt);
    expect(getTrialStart({ createdAt, trialStartedAt: null })).toEqual(createdAt);
  });

  it("usa trialStartedAt quando existe", () => {
    const trialStartedAt = new Date("2026-10-10T00:00:00.000Z");
    expect(
      getTrialStart({ createdAt: new Date("2026-10-01"), trialStartedAt }),
    ).toEqual(trialStartedAt);
  });

  it("aceita datas em string", () => {
    expect(getTrialStart({ createdAt: "2026-10-01T00:00:00.000Z" })).toEqual(
      new Date("2026-10-01T00:00:00.000Z"),
    );
  });
});

describe("resolveAccess", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("assinatura paga", () => {
    it("assinatura ativa libera o plano contratado", () => {
      const periodEnd = daysFromNow(20);
      const access = resolveAccess(
        { createdAt: daysFromNow(-100) },
        sub({ plan: "PLUS", status: "active", currentPeriodEnd: periodEnd }),
      );
      expect(access).toEqual({ kind: "ACTIVE", plan: "PLUS", endsAt: periodEnd });
    });

    it("assinatura ativa vale mais que o trial vencido", () => {
      const access = resolveAccess(
        { createdAt: daysFromNow(-365) },
        sub({ plan: "PROFESSIONAL", status: "active" }),
      );
      expect(access.kind).toBe("ACTIVE");
      expect(access.plan).toBe("PROFESSIONAL");
      expect(access.endsAt).toBeNull();
    });

    it("assinatura cancelada não libera nada além do trial", () => {
      const access = resolveAccess(
        { createdAt: daysFromNow(-365) },
        sub({ plan: "PLUS", status: "canceled" }),
      );
      expect(access.kind).toBe("EXPIRED");
      expect(access.plan).toBeNull();
    });
  });

  describe("meses grátis por indicação", () => {
    it("quem nunca pagou ganha o plano Plus", () => {
      const bonusUntil = daysFromNow(30);
      const access = resolveAccess(
        { createdAt: daysFromNow(-100) },
        sub({ bonusUntil }),
      );
      expect(access).toEqual({ kind: "BONUS", plan: "PLUS", endsAt: bonusUntil });
    });

    it("quem já pagou mantém o plano que tinha", () => {
      const access = resolveAccess(
        { createdAt: daysFromNow(-100) },
        sub({
          plan: "PROFESSIONAL",
          status: "canceled",
          abacatepaySubscriptionId: "subs_1",
          bonusUntil: daysFromNow(10),
        }),
      );
      expect(access.kind).toBe("BONUS");
      expect(access.plan).toBe("PROFESSIONAL");
    });

    it("bônus vencido não libera nada", () => {
      const access = resolveAccess(
        { createdAt: daysFromNow(-100) },
        sub({ bonusUntil: daysFromNow(-1) }),
      );
      expect(access.kind).toBe("EXPIRED");
    });

    it("assinatura ativa tem prioridade sobre o bônus", () => {
      const access = resolveAccess(
        { createdAt: daysFromNow(-100) },
        sub({ plan: "BASIC", status: "active", bonusUntil: daysFromNow(60) }),
      );
      expect(access.kind).toBe("ACTIVE");
      expect(access.plan).toBe("BASIC");
    });

    it("bônus tem prioridade sobre o trial", () => {
      const access = resolveAccess(
        { createdAt: daysFromNow(-1) },
        sub({ bonusUntil: daysFromNow(30) }),
      );
      expect(access.kind).toBe("BONUS");
    });
  });

  describe("teste grátis", () => {
    it("conta 14 dias a partir do cadastro", () => {
      const createdAt = daysFromNow(-5);
      const access = resolveAccess({ createdAt }, null);
      expect(access.kind).toBe("TRIAL");
      expect(access.plan).toBeNull();
      expect(access.endsAt).toEqual(daysFromNow(9));
    });

    it("conta a partir da confirmação do e-mail quando existe", () => {
      const access = resolveAccess(
        { createdAt: daysFromNow(-30), trialStartedAt: daysFromNow(-1) },
        null,
      );
      expect(access.kind).toBe("TRIAL");
      expect(access.endsAt).toEqual(daysFromNow(13));
    });

    it("expira depois de 14 dias", () => {
      const access = resolveAccess({ createdAt: daysFromNow(-15) }, null);
      expect(access.kind).toBe("EXPIRED");
      expect(access.plan).toBeNull();
    });

    it("no exato fim do trial já está expirado", () => {
      const access = resolveAccess({ createdAt: daysFromNow(-14) }, null);
      expect(access.kind).toBe("EXPIRED");
    });

    it("um milissegundo antes do fim ainda é trial", () => {
      const createdAt = new Date(daysFromNow(-14).getTime() + 1);
      expect(resolveAccess({ createdAt }, null).kind).toBe("TRIAL");
    });

    it("subscription sem status (só checkout iniciado) segue no trial", () => {
      const access = resolveAccess(
        { createdAt: daysFromNow(-2) },
        sub({ status: null }),
      );
      expect(access.kind).toBe("TRIAL");
    });

    it("aceita uma data customizada de referência", () => {
      const access = resolveAccess(
        { createdAt: new Date("2026-01-01T00:00:00.000Z") },
        null,
        new Date("2026-01-05T00:00:00.000Z"),
      );
      expect(access.kind).toBe("TRIAL");
    });
  });
});
