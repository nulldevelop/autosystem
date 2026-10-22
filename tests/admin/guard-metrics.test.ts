import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));
vi.mock("@/lib/getSession", () => ({ getSession: vi.fn() }));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import {
  AdminError,
  getAdmin,
  requireAdmin,
  requireAdminPage,
} from "@/lib/admin/guard";
import {
  PAGE_SIZE,
  computeMrr,
  countByPlan,
  monthlyValue,
  parsePage,
  totalPages,
} from "@/lib/admin/metrics";
import { getSession } from "@/lib/getSession";

const session = { user: { id: "u1" } };
const adminRow = {
  id: "u1",
  email: "admin@x.com",
  name: "Admin",
  role: "admin",
  blockedAt: null,
};

beforeEach(() => {
  resetPrismaMock();
  vi.mocked(getSession).mockReset();
});

describe("getAdmin", () => {
  it("sem sessão: null, sem consultar o banco", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    await expect(getAdmin()).resolves.toBeNull();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("lê o papel do BANCO, não da sessão", async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: "u1", role: "admin" },
    } as never);
    prismaMock.user.findUnique.mockResolvedValue({ ...adminRow, role: "user" });

    await expect(getAdmin()).resolves.toBeNull();
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "u1" },
      select: expect.objectContaining({ role: true, blockedAt: true }),
    });
  });

  it("admin válido", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.user.findUnique.mockResolvedValue(adminRow);

    await expect(getAdmin()).resolves.toEqual({
      id: "u1",
      email: "admin@x.com",
      name: "Admin",
    });
  });

  it("admin bloqueado perde o acesso", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.user.findUnique.mockResolvedValue({
      ...adminRow,
      blockedAt: new Date(),
    });

    await expect(getAdmin()).resolves.toBeNull();
  });

  it("usuário apagado: null", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(getAdmin()).resolves.toBeNull();
  });
});

describe("requireAdmin", () => {
  it("UNAUTHORIZED sem sessão", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toMatchObject({
      name: "AdminError",
      code: "UNAUTHORIZED",
    });
  });

  it("FORBIDDEN para usuário comum", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.user.findUnique.mockResolvedValue({ ...adminRow, role: "user" });

    const error = await requireAdmin().catch((e) => e);
    expect(error).toBeInstanceOf(AdminError);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe("Acesso restrito a administradores.");
  });

  it("devolve o admin", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.user.findUnique.mockResolvedValue(adminRow);
    await expect(requireAdmin()).resolves.toMatchObject({ id: "u1" });
  });

  it("mensagem de não autenticado", () => {
    expect(new AdminError("UNAUTHORIZED").message).toBe(
      "Você precisa estar autenticado.",
    );
  });
});

describe("requireAdminPage", () => {
  it("não-admin recebe 404 (o painel não revela que existe)", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.user.findUnique.mockResolvedValue({ ...adminRow, role: "user" });
    await expect(requireAdminPage()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("admin passa", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.user.findUnique.mockResolvedValue(adminRow);
    await expect(requireAdminPage()).resolves.toMatchObject({ id: "u1" });
  });
});

describe("monthlyValue / computeMrr / countByPlan", () => {
  it("plano mensal usa o preço mensal", () => {
    expect(monthlyValue("PLUS", "monthly")).toBe(119.99);
  });

  it("plano anual é dividido por 12", () => {
    expect(monthlyValue("PLUS", "yearly")).toBeCloseTo(1199.9 / 12, 5);
  });

  it("sem intervalo conhecido assume mensal", () => {
    expect(monthlyValue("BASIC", null)).toBe(79.99);
    expect(monthlyValue("BASIC", undefined)).toBe(79.99);
  });

  it("plano desconhecido vale zero", () => {
    expect(monthlyValue("OUTRO" as never, "monthly")).toBe(0);
  });

  it("MRR soma os planos e arredonda em centavos", () => {
    const mrr = computeMrr([
      { plan: "BASIC", pendingInterval: "monthly" },
      { plan: "PLUS", pendingInterval: "yearly" },
      { plan: "PROFESSIONAL", pendingInterval: "monthly" },
    ]);
    expect(mrr).toBe(Math.round((79.99 + 1199.9 / 12 + 179.99) * 100) / 100);
  });

  it("MRR sem assinaturas é zero", () => {
    expect(computeMrr([])).toBe(0);
  });

  it("conta assinaturas por plano", () => {
    expect(
      countByPlan([{ plan: "BASIC" }, { plan: "BASIC" }, { plan: "PLUS" }]),
    ).toEqual({ BASIC: 2, PLUS: 1, PROFESSIONAL: 0 });
  });
});

describe("paginação", () => {
  it("página padrão é 1", () => {
    expect(parsePage(undefined)).toEqual({ page: 1, skip: 0, take: PAGE_SIZE });
  });

  it.each([
    ["3", 3, 2 * PAGE_SIZE],
    [["2", "9"], 2, PAGE_SIZE],
    ["0", 1, 0],
    ["-4", 1, 0],
    ["abc", 1, 0],
    ["", 1, 0],
  ])("parsePage(%j)", (input, page, skip) => {
    expect(parsePage(input as never)).toEqual({ page, skip, take: PAGE_SIZE });
  });

  it("totalPages arredonda para cima e nunca é menor que 1", () => {
    expect(totalPages(0)).toBe(1);
    expect(totalPages(PAGE_SIZE)).toBe(1);
    expect(totalPages(PAGE_SIZE + 1)).toBe(2);
    expect(totalPages(PAGE_SIZE * 3)).toBe(3);
  });
});
