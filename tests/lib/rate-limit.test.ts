import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));

import { getClientIp, hashKey, rateLimit } from "@/lib/rate-limit";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const options = { limit: 3, windowSeconds: 3600 };
const queryRaw = () => prismaMock.$queryRaw;

function bucket(count: number, secondsLeft = 600) {
  queryRaw().mockResolvedValue([
    { count, resetAt: new Date(NOW.getTime() + secondsLeft * 1000) },
  ]);
}

beforeEach(() => {
  resetPrismaMock();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(Math, "random").mockReturnValue(0.5); // sem limpeza ocasional
});
afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it.each([
    [1, true, 2],
    [2, true, 1],
    [3, true, 0], // a 3ª tentativa ainda é permitida
    [4, false, 0],
    [50, false, 0],
  ])("contagem %i → permitido=%s, restam %i", async (count, allowed, remaining) => {
    bucket(count);

    const result = await rateLimit("signup:ip:1.2.3.4", options);

    expect(result.allowed).toBe(allowed);
    expect(result.remaining).toBe(remaining);
  });

  it("informa quanto falta para a janela reabrir", async () => {
    bucket(9, 125);
    const result = await rateLimit("k", options);
    expect(result.retryAfterSeconds).toBe(125);
  });

  it("nunca devolve espera menor que 1 segundo", async () => {
    bucket(9, -5);
    const result = await rateLimit("k", options);
    expect(result.retryAfterSeconds).toBe(1);
  });

  it("faz uma única consulta atômica com a chave e a janela", async () => {
    bucket(1);

    await rateLimit("signup:ip:1.2.3.4", options);

    expect(queryRaw()).toHaveBeenCalledTimes(1);
    const [strings, ...values] = queryRaw().mock.calls[0];
    expect(strings.join("?")).toContain("ON CONFLICT");
    expect(values).toContain("signup:ip:1.2.3.4");
    expect(values).toContain(3600);
  });

  it("se o banco falhar, libera em vez de derrubar o cadastro", async () => {
    queryRaw().mockRejectedValue(new Error("db"));

    const result = await rateLimit("k", options);

    expect(result).toEqual({ allowed: true, remaining: 3, retryAfterSeconds: 0 });
    expect(console.error).toHaveBeenCalled();
  });

  it("de vez em quando apaga contadores vencidos há mais de um dia", async () => {
    bucket(1);
    vi.spyOn(Math, "random").mockReturnValue(0.001);
    prismaMock.rateLimitBucket.deleteMany.mockResolvedValue({ count: 2 });

    await rateLimit("k", options);

    expect(prismaMock.rateLimitBucket.deleteMany).toHaveBeenCalledWith({
      where: { resetAt: { lt: new Date(NOW.getTime() - 86_400_000) } },
    });
  });

  it("falha na limpeza não afeta o resultado", async () => {
    bucket(1);
    vi.spyOn(Math, "random").mockReturnValue(0.001);
    prismaMock.rateLimitBucket.deleteMany.mockRejectedValue(new Error("x"));

    await expect(rateLimit("k", options)).resolves.toMatchObject({ allowed: true });
  });
});

describe("getClientIp", () => {
  const headers = (init: Record<string, string>) => new Headers(init);

  it("usa o primeiro IP de x-forwarded-for", () => {
    expect(getClientIp(headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe(
      "203.0.113.9",
    );
  });

  it("cai para x-real-ip", () => {
    expect(getClientIp(headers({ "x-real-ip": " 198.51.100.7 " }))).toBe("198.51.100.7");
  });

  it("sem cabeçalhos devolve 'unknown'", () => {
    expect(getClientIp(headers({}))).toBe("unknown");
  });
});

describe("hashKey", () => {
  it("é estável e ignora caixa e espaços", () => {
    expect(hashKey("Ana@Example.com ")).toBe(hashKey("ana@example.com"));
  });

  it("não guarda o e-mail em texto", () => {
    const hash = hashKey("ana@example.com");
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
    expect(hash).not.toContain("ana");
  });

  it("e-mails diferentes geram hashes diferentes", () => {
    expect(hashKey("a@x.com")).not.toBe(hashKey("b@x.com"));
  });
});
