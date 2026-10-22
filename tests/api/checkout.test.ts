import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("@/lib/abacatepay", () => ({
  createCustomer: vi.fn(),
  createSubscriptionCheckout: vi.fn(),
  getProductId: vi.fn(),
}));

import { POST } from "@/app/api/checkout/route";
import {
  createCustomer,
  createSubscriptionCheckout,
  getProductId,
} from "@/lib/abacatepay";
import { auth } from "@/lib/auth";

const getSession = vi.mocked(auth.api.getSession) as unknown as ReturnType<
  typeof vi.fn
>;

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://autosystem.test/api/checkout", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const session = {
  user: { id: "user-1", email: "ana@example.com", name: "Ana" },
};

beforeEach(() => {
  resetPrismaMock();
  getSession.mockReset();
  vi.mocked(createCustomer).mockReset();
  vi.mocked(createSubscriptionCheckout).mockReset();
  vi.mocked(getProductId).mockReset();
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://autosystem.nulldev.com.br");
  vi.spyOn(console, "error").mockImplementation(() => {});
  getSession.mockResolvedValue(session);
  vi.mocked(getProductId).mockReturnValue("prod_plus_monthly");
  vi.mocked(createCustomer).mockResolvedValue({ id: "cust_new" });
  vi.mocked(createSubscriptionCheckout).mockResolvedValue({
    id: "bill_1",
    url: "https://pay.abacatepay.com/bill_1",
  });
  prismaMock.subscription.findUnique.mockResolvedValue(null);
});

describe("validações", () => {
  it("401 sem sessão", async () => {
    getSession.mockResolvedValue(null);
    const res = await POST(request({ planSlug: "PLUS", billingInterval: "monthly" }));
    expect(res.status).toBe(401);
    expect(createSubscriptionCheckout).not.toHaveBeenCalled();
  });

  it.each([
    [{ billingInterval: "monthly" }],
    [{ planSlug: "PLUS" }],
    [{}],
  ])("400 quando faltam campos: %o", async (body) => {
    const res = await POST(request(body));
    expect(res.status).toBe(400);
  });

  it("400 para intervalo inválido", async () => {
    const res = await POST(request({ planSlug: "PLUS", billingInterval: "weekly" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("inválido");
  });

  it("404 para plano inexistente", async () => {
    const res = await POST(request({ planSlug: "ENTERPRISE", billingInterval: "monthly" }));
    expect(res.status).toBe(404);
  });

  it("400 quando o produto do plano não está configurado", async () => {
    vi.mocked(getProductId).mockReturnValue(undefined);
    const res = await POST(request({ planSlug: "PLUS", billingInterval: "yearly" }));
    expect(res.status).toBe(400);
    expect(createSubscriptionCheckout).not.toHaveBeenCalled();
  });
});

describe("criação do checkout", () => {
  it("cria o cliente na primeira compra e devolve a URL de pagamento", async () => {
    const res = await POST(request({ planSlug: "PLUS", billingInterval: "monthly" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ url: "https://pay.abacatepay.com/bill_1" });
    expect(createCustomer).toHaveBeenCalledWith({
      email: "ana@example.com",
      name: "Ana",
      userId: "user-1",
    });
    expect(getProductId).toHaveBeenCalledWith("PLUS", "monthly");
  });

  it("reaproveita o cliente já cadastrado", async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      abacatepayCustomerId: "cust_existing",
    });

    await POST(request({ planSlug: "PLUS", billingInterval: "monthly" }));

    expect(createCustomer).not.toHaveBeenCalled();
    expect(createSubscriptionCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: "cust_existing" }),
    );
  });

  it("monta URLs de retorno a partir de NEXT_PUBLIC_APP_URL", async () => {
    await POST(request({ planSlug: "BASIC", billingInterval: "yearly" }));

    expect(createSubscriptionCheckout).toHaveBeenCalledWith({
      productId: "prod_plus_monthly",
      customerId: "cust_new",
      externalId: "user-1",
      completionUrl: "https://autosystem.nulldev.com.br/dashboard/plans/success",
      returnUrl: "https://autosystem.nulldev.com.br/dashboard/plans",
      metadata: { userId: "user-1", planSlug: "BASIC", billingInterval: "yearly" },
    });
  });

  it("sem NEXT_PUBLIC_APP_URL usa o origin da requisição", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");

    await POST(
      request(
        { planSlug: "PLUS", billingInterval: "monthly" },
        { origin: "http://localhost:3000" },
      ),
    );

    expect(createSubscriptionCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        completionUrl: "http://localhost:3000/dashboard/plans/success",
      }),
    );
  });

  it("sem nada configurado cai para localhost", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "");

    await POST(request({ planSlug: "PLUS", billingInterval: "monthly" }));

    expect(createSubscriptionCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        returnUrl: "http://localhost:3000/dashboard/plans",
      }),
    );
  });

  it("guarda o plano como pendente, sem ativar", async () => {
    await POST(request({ planSlug: "PROFESSIONAL", billingInterval: "yearly" }));

    const pending = {
      abacatepayCustomerId: "cust_new",
      abacatepayCheckoutId: "bill_1",
      pendingPlan: "PROFESSIONAL",
      pendingInterval: "yearly",
    };
    expect(prismaMock.subscription.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      create: { userId: "user-1", ...pending },
      update: pending,
    });
    const call = prismaMock.subscription.upsert.mock.calls[0][0];
    expect(call.update).not.toHaveProperty("status");
    expect(call.update).not.toHaveProperty("plan");
  });

  it("cliente sem nome é enviado sem nome", async () => {
    getSession.mockResolvedValue({
      user: { id: "user-1", email: "ana@example.com", name: "" },
    });

    await POST(request({ planSlug: "PLUS", billingInterval: "monthly" }));

    expect(createCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ name: undefined }),
    );
  });
});

describe("falhas", () => {
  it("500 quando a AbacatePay falha", async () => {
    vi.mocked(createSubscriptionCheckout).mockRejectedValue(new Error("down"));
    const res = await POST(request({ planSlug: "PLUS", billingInterval: "monthly" }));
    expect(res.status).toBe(500);
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
  });

  it("500 quando o corpo não é JSON", async () => {
    const res = await POST(request("isso não é json"));
    expect(res.status).toBe(500);
  });
});
