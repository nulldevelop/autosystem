import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelSubscription,
  createCustomer,
  createSubscriptionCheckout,
  getProductId,
  getSubscription,
} from "@/lib/abacatepay";

const fetchMock = vi.fn();

function respond(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const ok = (data: unknown) => ({ data, success: true, error: null });

function lastCall() {
  const [url, init] = fetchMock.mock.calls.at(-1) as [string, RequestInit];
  return {
    url,
    init,
    body: init.body ? JSON.parse(init.body as string) : undefined,
  };
}

describe("cliente AbacatePay", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("ABACATEPAY_API_KEY", "abc_test_key");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("envia Bearer token e usa a base da API v2", async () => {
    respond(ok({ id: "cust_1" }));
    await createCustomer({ email: "a@b.com", name: "Ana", userId: "u1" });

    const { url, init } = lastCall();
    expect(url).toBe("https://api.abacatepay.com/v2/customers/create");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer abc_test_key",
      "Content-Type": "application/json",
    });
  });

  it("falha cedo se a chave não estiver configurada", async () => {
    vi.stubEnv("ABACATEPAY_API_KEY", "");
    await expect(
      createCustomer({ email: "a@b.com", userId: "u1" }),
    ).rejects.toThrow("ABACATEPAY_API_KEY não configurada");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("createCustomer manda e-mail, nome e o userId no metadata", async () => {
    respond(ok({ id: "cust_1" }));
    const customer = await createCustomer({
      email: "ana@example.com",
      name: "Ana",
      userId: "user-1",
    });

    expect(customer).toEqual({ id: "cust_1" });
    expect(lastCall().body).toEqual({
      email: "ana@example.com",
      name: "Ana",
      metadata: { userId: "user-1" },
    });
  });

  it("createSubscriptionCheckout monta o item com quantidade 1", async () => {
    respond(ok({ id: "bill_1", url: "https://pay.example/bill_1" }));
    const checkout = await createSubscriptionCheckout({
      productId: "prod_1",
      customerId: "cust_1",
      externalId: "user-1",
      completionUrl: "https://app/ok",
      returnUrl: "https://app/back",
      metadata: { userId: "user-1" },
    });

    expect(checkout.url).toBe("https://pay.example/bill_1");
    const { url, body } = lastCall();
    expect(url).toBe("https://api.abacatepay.com/v2/subscriptions/create");
    expect(body).toEqual({
      items: [{ id: "prod_1", quantity: 1 }],
      customerId: "cust_1",
      externalId: "user-1",
      completionUrl: "https://app/ok",
      returnUrl: "https://app/back",
      metadata: { userId: "user-1" },
    });
  });

  it("getSubscription usa GET e ignora filtros vazios", async () => {
    respond(ok({ id: "subs_1", status: "ACTIVE", amount: 100 }));
    const sub = await getSubscription({ id: "subs_1", customerId: undefined });

    expect(sub.status).toBe("ACTIVE");
    const { url, init } = lastCall();
    expect(url).toBe("https://api.abacatepay.com/v2/subscriptions/get?id=subs_1");
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
  });

  it("getSubscription aceita customerId e externalId", async () => {
    respond(ok({ id: "subs_1" }));
    await getSubscription({ customerId: "cust_1", externalId: "user-1" });
    expect(lastCall().url).toContain("customerId=cust_1");
    expect(lastCall().url).toContain("externalId=user-1");
  });

  it("cancelSubscription envia o id", async () => {
    respond(ok({ id: "subs_1", status: "CANCELLED" }));
    const result = await cancelSubscription("subs_1");

    expect(result.status).toBe("CANCELLED");
    const { url, body } = lastCall();
    expect(url).toBe("https://api.abacatepay.com/v2/subscriptions/cancel");
    expect(body).toEqual({ id: "subs_1" });
  });

  it("lança com status e mensagem quando a API responde erro HTTP", async () => {
    respond({ data: null, success: false, error: "Insufficient permissions" }, 401);
    await expect(getSubscription({ id: "x" })).rejects.toThrow(
      "/subscriptions/get?id=x falhou (401): Insufficient permissions",
    );
  });

  it("lança quando success é false mesmo com HTTP 200", async () => {
    respond({ data: null, success: false, error: "algo deu errado" });
    await expect(cancelSubscription("subs_1")).rejects.toThrow("algo deu errado");
  });

  it("lança com 'sem detalhes' quando o corpo não é JSON", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error("invalid json");
      },
    });
    await expect(cancelSubscription("subs_1")).rejects.toThrow("sem detalhes");
  });
});

describe("getProductId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ["BASIC", "monthly", "ABACATEPAY_BASIC_MONTHLY_PRODUCT_ID"],
    ["BASIC", "yearly", "ABACATEPAY_BASIC_YEARLY_PRODUCT_ID"],
    ["PLUS", "monthly", "ABACATEPAY_PLUS_MONTHLY_PRODUCT_ID"],
    ["PLUS", "yearly", "ABACATEPAY_PLUS_YEARLY_PRODUCT_ID"],
    ["PROFESSIONAL", "monthly", "ABACATEPAY_PRO_MONTHLY_PRODUCT_ID"],
    ["PROFESSIONAL", "yearly", "ABACATEPAY_PRO_YEARLY_PRODUCT_ID"],
  ] as const)("%s %s lê %s", (plan, interval, envName) => {
    vi.stubEnv(envName, `prod_${envName}`);
    expect(getProductId(plan, interval)).toBe(`prod_${envName}`);
  });

  it("devolve undefined quando a variável não existe", () => {
    vi.stubEnv("ABACATEPAY_PLUS_YEARLY_PRODUCT_ID", "");
    expect(getProductId("PLUS", "yearly")).toBeFalsy();
  });
});
