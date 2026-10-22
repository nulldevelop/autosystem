import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));
vi.mock("@/lib/abacatepay", () => ({ cancelSubscription: vi.fn() }));
vi.mock("@/lib/admin/audit", () => ({ writeAudit: vi.fn() }));
vi.mock("@/lib/admin/guard", async () => {
  const actual = await vi.importActual<typeof import("@/lib/admin/guard")>(
    "@/lib/admin/guard",
  );
  return { ...actual, requireAdmin: vi.fn() };
});

import {
  cancelUserSubscription,
  grantFreeDays,
  setUserBlocked,
} from "@/app/(admin)/admin/_actions/admin-actions";
import { cancelSubscription } from "@/lib/abacatepay";
import { writeAudit } from "@/lib/admin/audit";
import { AdminError, requireAdmin } from "@/lib/admin/guard";
import { revalidatePath } from "next/cache";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const admin = { id: "admin-1", email: "admin@x.com", name: "Admin" };

beforeEach(() => {
  resetPrismaMock();
  vi.mocked(requireAdmin).mockReset();
  vi.mocked(writeAudit).mockReset();
  vi.mocked(cancelSubscription).mockReset();
  vi.mocked(revalidatePath).mockReset();
  vi.mocked(requireAdmin).mockResolvedValue(admin);
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
});

describe.each([
  ["grantFreeDays", () => grantFreeDays({ userId: "u1", days: 30 })],
  ["cancelUserSubscription", () => cancelUserSubscription({ userId: "u1" })],
  ["setUserBlocked", () => setUserBlocked({ userId: "u1", blocked: true })],
])("%s: controle de acesso", (_name, run) => {
  it("recusa quem não é admin e não toca no banco", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new AdminError("FORBIDDEN"));

    const result = await run();

    expect(result).toEqual({
      success: false,
      message: "Acesso restrito a administradores.",
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(writeAudit).not.toHaveBeenCalled();
  });

  it("recusa visitante sem sessão", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new AdminError("UNAUTHORIZED"));
    await expect(run()).resolves.toMatchObject({ success: false });
  });

  it("erro inesperado vira mensagem genérica", async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error("db caiu"));
    const result = await run();
    expect(result.success).toBe(false);
    expect(result.message).not.toContain("db caiu");
  });
});

describe("grantFreeDays", () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue({ email: "ana@x.com" });
  });

  it.each([0, -1, 366, 1.5, "abc", null])("recusa dias inválidos (%s)", async (days) => {
    const result = await grantFreeDays({ userId: "u1", days });
    expect(result).toEqual({ success: false, message: "Informe de 1 a 365 dias." });
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
  });

  it("aceita dias como texto (vem de um input)", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    const result = await grantFreeDays({ userId: "u1", days: "30" });
    expect(result.success).toBe(true);
  });

  it("usuário inexistente", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(grantFreeDays({ userId: "x", days: 5 })).resolves.toEqual({
      success: false,
      message: "Usuário não encontrado.",
    });
  });

  it("soma a partir de hoje quando não há bônus", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);

    const result = await grantFreeDays({ userId: "u1", days: 30 });

    const bonusUntil = new Date("2026-11-21T12:00:00.000Z");
    expect(result).toEqual({
      success: true,
      message: "30 dia(s) grátis concedidos a ana@x.com.",
    });
    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith({
      where: { userId: "u1" },
      create: { userId: "u1", bonusUntil },
      update: { bonusUntil },
    });
  });

  it("soma ao bônus que ainda não venceu", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      bonusUntil: new Date("2026-11-01T12:00:00.000Z"),
    });

    await grantFreeDays({ userId: "u1", days: 10 });

    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { bonusUntil: new Date("2026-11-11T12:00:00.000Z") },
      }),
    );
  });

  it("recomeça de hoje quando o bônus já venceu", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      bonusUntil: new Date("2026-01-01T00:00:00.000Z"),
    });

    await grantFreeDays({ userId: "u1", days: 7 });

    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { bonusUntil: new Date("2026-10-29T12:00:00.000Z") },
      }),
    );
  });

  it("registra auditoria e atualiza as listas", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null);

    await grantFreeDays({ userId: "u1", days: 30 });

    expect(writeAudit).toHaveBeenCalledWith({
      adminId: "admin-1",
      action: "GRANT_FREE_DAYS",
      targetType: "user",
      targetId: "u1",
      details: { days: 30, bonusUntil: "2026-11-21T12:00:00.000Z" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/admin/usuarios");
  });
});

describe("cancelUserSubscription", () => {
  const active = {
    id: "sub-row",
    status: "active",
    plan: "PLUS",
    abacatepaySubscriptionId: "subs_1",
  };

  it("dados inválidos", async () => {
    await expect(cancelUserSubscription({})).resolves.toEqual({
      success: false,
      message: "Dados inválidos.",
    });
  });

  it.each([null, { ...active, status: "canceled" }, { ...active, status: null }])(
    "só cancela assinatura ativa (%o)",
    async (subscription) => {
      prismaMock.subscription.findUnique.mockResolvedValue(subscription);

      const result = await cancelUserSubscription({ userId: "u1" });

      expect(result).toEqual({
        success: false,
        message: "Este usuário não tem assinatura ativa.",
      });
      expect(cancelSubscription).not.toHaveBeenCalled();
    },
  );

  it("cancela na AbacatePay e depois no sistema, com auditoria", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(active);
    vi.mocked(cancelSubscription).mockResolvedValue({} as never);

    const result = await cancelUserSubscription({ userId: "u1" });

    expect(result).toEqual({ success: true, message: "Assinatura cancelada." });
    expect(cancelSubscription).toHaveBeenCalledWith("subs_1");
    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: "sub-row" },
      data: { status: "canceled" },
    });
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CANCEL_SUBSCRIPTION",
        targetType: "subscription",
        targetId: "sub-row",
      }),
    );
  });

  it("se a AbacatePay falhar, nada muda no sistema", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(active);
    vi.mocked(cancelSubscription).mockRejectedValue(new Error("fora do ar"));

    const result = await cancelUserSubscription({ userId: "u1" });

    expect(result.success).toBe(false);
    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
    expect(writeAudit).not.toHaveBeenCalled();
  });

  it("assinatura manual (sem ID na AbacatePay) só atualiza o sistema", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      ...active,
      abacatepaySubscriptionId: null,
    });

    const result = await cancelUserSubscription({ userId: "u1" });

    expect(result.success).toBe(true);
    expect(cancelSubscription).not.toHaveBeenCalled();
    expect(prismaMock.subscription.update).toHaveBeenCalled();
  });
});

describe("setUserBlocked", () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue({
      email: "ana@x.com",
      role: "user",
    });
  });

  it("dados inválidos", async () => {
    await expect(setUserBlocked({ userId: "u1" })).resolves.toEqual({
      success: false,
      message: "Dados inválidos.",
    });
  });

  it("não deixa o admin bloquear a si mesmo", async () => {
    const result = await setUserBlocked({ userId: "admin-1", blocked: true });

    expect(result).toEqual({
      success: false,
      message: "Você não pode bloquear a si mesmo.",
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("usuário inexistente", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(
      setUserBlocked({ userId: "x", blocked: true }),
    ).resolves.toMatchObject({ message: "Usuário não encontrado." });
  });

  it("não bloqueia outro administrador pelo painel", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      email: "outro@x.com",
      role: "admin",
    });

    const result = await setUserBlocked({ userId: "u2", blocked: true });

    expect(result.success).toBe(false);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("bloquear grava a data, derruba as sessões e audita", async () => {
    const result = await setUserBlocked({ userId: "u1", blocked: true });

    expect(result).toEqual({
      success: true,
      message: "ana@x.com foi bloqueado e desconectado.",
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { blockedAt: NOW },
    });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
    });
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "BLOCK_USER", targetId: "u1" }),
    );
  });

  it("desbloquear limpa a data e mantém as sessões como estão", async () => {
    const result = await setUserBlocked({ userId: "u1", blocked: false });

    expect(result.message).toBe("ana@x.com foi desbloqueado.");
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { blockedAt: null },
    });
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "UNBLOCK_USER" }),
    );
  });
});
