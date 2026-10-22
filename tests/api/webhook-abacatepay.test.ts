import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));
vi.mock("@/lib/abacatepay", () => ({
  getSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
}));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/referral", () => ({
  rewardReferrerForFirstPayment: vi.fn(),
}));

import { POST } from "@/app/api/webhooks/abacatepay/route";
import { cancelSubscription, getSubscription } from "@/lib/abacatepay";
import { sendEmail } from "@/lib/email";
import { rewardReferrerForFirstPayment } from "@/lib/referral";

const NOW = new Date("2026-10-22T12:00:00.000Z");
const SECRET = "s3cret";

function webhook(payload: unknown, secret: string | null = SECRET) {
  const url = new URL("https://autosystem.test/api/webhooks/abacatepay");
  if (secret !== null) url.searchParams.set("webhookSecret", secret);
  return new Request(url, {
    method: "POST",
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

const event = (name: string, data: unknown = { id: "subs_new" }) => ({
  event: name,
  data,
});

const remote = (overrides = {}) => ({
  id: "subs_new",
  checkoutId: "bill_1",
  customerId: "cust_1",
  amount: 11999,
  status: "ACTIVE" as const,
  ...overrides,
});

const row = (overrides = {}) => ({
  id: "sub-row",
  userId: "user-1",
  plan: "BASIC",
  pendingPlan: "PLUS",
  pendingInterval: "monthly",
  abacatepaySubscriptionId: null,
  currentPeriodEnd: null,
  ...overrides,
});

beforeEach(() => {
  resetPrismaMock();
  vi.mocked(getSubscription).mockReset();
  vi.mocked(cancelSubscription).mockReset();
  vi.mocked(sendEmail).mockReset();
  vi.mocked(rewardReferrerForFirstPayment).mockReset();
  vi.stubEnv("ABACATEPAY_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://autosystem.nulldev.com.br");
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe("autenticação do webhook", () => {
  it("recusa sem o webhookSecret", async () => {
    const res = await POST(webhook(event("subscription.completed"), null));
    expect(res.status).toBe(401);
    expect(getSubscription).not.toHaveBeenCalled();
  });

  it("recusa segredo errado", async () => {
    const res = await POST(webhook(event("subscription.completed"), "errado"));
    expect(res.status).toBe(401);
  });

  it("recusa segredo com tamanho diferente sem lançar", async () => {
    const res = await POST(webhook(event("subscription.completed"), "x"));
    expect(res.status).toBe(401);
  });

  it("recusa tudo se o servidor não tem segredo configurado", async () => {
    vi.stubEnv("ABACATEPAY_WEBHOOK_SECRET", "");
    const res = await POST(webhook(event("subscription.completed"), ""));
    expect(res.status).toBe(401);
  });

  it("responde 400 para corpo que não é JSON", async () => {
    const res = await POST(webhook("não sou json"));
    expect(res.status).toBe(400);
  });
});

describe("eventos ignorados", () => {
  it("confirma eventos que não são de assinatura sem consultar a API", async () => {
    const res = await POST(webhook(event("checkout.completed")));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
    expect(getSubscription).not.toHaveBeenCalled();
  });

  it("confirma payload sem o campo event", async () => {
    const res = await POST(webhook({ data: {} }));
    expect(res.status).toBe(200);
    expect(getSubscription).not.toHaveBeenCalled();
  });

  it("confirma e registra quando o payload não traz nenhum identificador", async () => {
    const res = await POST(
      webhook(event("subscription.completed", { foo: "bar" })),
    );
    expect(res.status).toBe(200);
    expect(getSubscription).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("confirma quando a assinatura local não existe", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.subscription.findFirst.mockResolvedValue(null);

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(200);
    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
  });

  it("ignora eventos de assinatura desconhecidos", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());

    const res = await POST(webhook(event("subscription.trial_started")));

    expect(res.status).toBe(200);
    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
  });
});

describe("localização da assinatura", () => {
  it("encontra o ID da assinatura em qualquer lugar do payload", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());
    prismaMock.user.findUnique.mockResolvedValue({ email: "a@b.com", name: "A" });

    await POST(
      webhook(event("subscription.completed", { subscription: { id: "subs_deep" } })),
    );

    expect(getSubscription).toHaveBeenCalledWith({ id: "subs_deep" });
  });

  it("consulta pelo cliente quando só há cust_ no payload", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());
    prismaMock.user.findUnique.mockResolvedValue(null);

    await POST(
      webhook(event("subscription.completed", { customer: { id: "cust_9" } })),
    );

    expect(getSubscription).toHaveBeenCalledWith({ customerId: "cust_9" });
  });

  it("cai para o checkoutId quando o ID da assinatura ainda não está salvo", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValueOnce(null);
    prismaMock.subscription.findFirst.mockResolvedValue(row());
    prismaMock.user.findUnique.mockResolvedValue(null);

    await POST(webhook(event("subscription.completed")));

    expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith({
      where: { abacatepayCheckoutId: "bill_1" },
    });
    expect(prismaMock.subscription.update).toHaveBeenCalled();
  });

  it("cai para o customerId como último recurso", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(row());
    prismaMock.subscription.findFirst.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await POST(webhook(event("subscription.completed")));

    expect(prismaMock.subscription.findUnique).toHaveBeenLastCalledWith({
      where: { abacatepayCustomerId: "cust_1" },
    });
    expect(prismaMock.subscription.update).toHaveBeenCalled();
  });

  it("não tenta checkout/cliente quando a API não devolve esses campos", async () => {
    vi.mocked(getSubscription).mockResolvedValue(
      remote({ checkoutId: undefined, customerId: undefined }),
    );
    prismaMock.subscription.findUnique.mockResolvedValue(null);

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(200);
    expect(prismaMock.subscription.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.subscription.findUnique).toHaveBeenCalledTimes(1);
  });
});

describe("subscription.completed", () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue({
      email: "ana@example.com",
      name: "Ana Souza",
    });
  });

  it("ativa o plano pendente e calcula 1 mês de período", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(200);
    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: "sub-row" },
      data: {
        plan: "PLUS",
        status: "active",
        abacatepaySubscriptionId: "subs_new",
        currentPeriodEnd: new Date("2026-11-22T12:00:00.000Z"),
      },
    });
  });

  it("plano anual dá 12 meses de período", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ pendingInterval: "yearly", pendingPlan: "PROFESSIONAL" }),
    );

    await POST(webhook(event("subscription.completed")));

    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          plan: "PROFESSIONAL",
          currentPeriodEnd: new Date("2027-10-22T12:00:00.000Z"),
        }),
      }),
    );
  });

  it("sem plano pendente mantém o plano atual", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ pendingPlan: null, plan: "BASIC" }),
    );

    await POST(webhook(event("subscription.completed")));

    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ plan: "BASIC" }),
      }),
    );
  });

  it("recompensa quem indicou e agradece por e-mail na primeira vez", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());

    await POST(webhook(event("subscription.completed")));

    expect(rewardReferrerForFirstPayment).toHaveBeenCalledWith("user-1");
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const mail = vi.mocked(sendEmail).mock.calls[0][0];
    expect(mail.to).toBe("ana@example.com");
    expect(mail.subject).toBe("Obrigado! Seu plano Plus está ativo");
    expect(mail.html).toContain("https://autosystem.nulldev.com.br/dashboard");
    expect(mail.html).toContain("(mensal)");
  });

  it("e-mail de plano anual diz anual", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ pendingInterval: "yearly" }),
    );

    await POST(webhook(event("subscription.completed")));

    expect(vi.mocked(sendEmail).mock.calls[0][0].html).toContain("(anual)");
  });

  it("não reenvia o agradecimento se o webhook repetir", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_new" }),
    );

    await POST(webhook(event("subscription.completed")));

    expect(sendEmail).not.toHaveBeenCalled();
    expect(cancelSubscription).not.toHaveBeenCalled();
  });

  it("cancela a assinatura anterior numa troca de plano", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_old" }),
    );
    vi.mocked(cancelSubscription).mockResolvedValue(remote() as never);

    await POST(webhook(event("subscription.completed")));

    expect(cancelSubscription).toHaveBeenCalledWith("subs_old");
  });

  it("uma falha ao cancelar a antiga não derruba o webhook", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_old" }),
    );
    vi.mocked(cancelSubscription).mockRejectedValue(new Error("fora do ar"));

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(200);
    expect(rewardReferrerForFirstPayment).toHaveBeenCalled();
  });

  it("não ativa se a API diz que a assinatura não está ACTIVE", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote({ status: "PENDING" }));
    prismaMock.subscription.findUnique.mockResolvedValue(row());

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(200);
    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
    expect(rewardReferrerForFirstPayment).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("falha no e-mail de agradecimento não faz o webhook falhar", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());
    vi.mocked(sendEmail).mockRejectedValue(new Error("Resend fora do ar"));

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(200);
  });

  it("não quebra se o usuário sumiu antes do e-mail", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());
    prismaMock.user.findUnique.mockResolvedValue(null);

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("subscription.renewed", () => {
  it("estende o período a partir do fim atual", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({
        abacatepaySubscriptionId: "subs_new",
        currentPeriodEnd: new Date("2026-10-25T00:00:00.000Z"),
      }),
    );

    await POST(webhook(event("subscription.renewed")));

    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: "sub-row" },
      data: {
        status: "active",
        currentPeriodEnd: new Date("2026-11-25T00:00:00.000Z"),
      },
    });
  });

  it("recomeça de hoje se o período já tinha vencido", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({
        abacatepaySubscriptionId: "subs_new",
        currentPeriodEnd: new Date("2026-01-01T00:00:00.000Z"),
      }),
    );

    await POST(webhook(event("subscription.renewed")));

    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentPeriodEnd: new Date("2026-11-22T12:00:00.000Z"),
        }),
      }),
    );
  });

  it("renovação anual soma 12 meses", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({
        abacatepaySubscriptionId: "subs_new",
        pendingInterval: "yearly",
        currentPeriodEnd: null,
      }),
    );

    await POST(webhook(event("subscription.renewed")));

    expect(prismaMock.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currentPeriodEnd: new Date("2027-10-22T12:00:00.000Z"),
        }),
      }),
    );
  });

  it("ignora renovação de uma assinatura que não é a atual", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_outra" }),
    );

    await POST(webhook(event("subscription.renewed")));

    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
  });
});

describe("subscription.cancelled", () => {
  it("marca a assinatura atual como cancelada", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote({ status: "CANCELLED" }));
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_new" }),
    );

    await POST(webhook(event("subscription.cancelled")));

    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: "sub-row" },
      data: { status: "canceled" },
    });
  });

  it("ignora o cancelamento da assinatura antiga numa troca de plano", async () => {
    vi.mocked(getSubscription).mockResolvedValue(
      remote({ id: "subs_old", status: "CANCELLED" }),
    );
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_new" }),
    );

    await POST(webhook(event("subscription.cancelled", { id: "subs_old" })));

    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
  });
});

describe("histórico de pagamentos (BillingEvent)", () => {
  const withId = (name: string, id?: string) => ({
    id,
    event: name,
    data: { id: "subs_new" },
  });

  beforeEach(() => {
    prismaMock.user.findUnique.mockResolvedValue({ email: "a@b.com", name: "A" });
  });

  it("nova assinatura registra plano, intervalo e valor", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote({ amount: 119990 }));
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ pendingPlan: "PLUS", pendingInterval: "yearly" }),
    );

    await POST(webhook(withId("subscription.completed", "evt_1")));

    expect(prismaMock.billingEvent.create).toHaveBeenCalledWith({
      data: {
        eventId: "evt_1",
        userId: "user-1",
        type: "completed",
        plan: "PLUS",
        interval: "yearly",
        amount: 119990,
        abacatepaySubscriptionId: "subs_new",
      },
    });
  });

  it("amount ausente na API vira null", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote({ amount: undefined }));
    prismaMock.subscription.findUnique.mockResolvedValue(row());

    await POST(webhook(withId("subscription.completed")));

    expect(prismaMock.billingEvent.create.mock.calls[0][0].data.amount).toBeNull();
  });

  it("renovação registra o valor cobrado", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote({ amount: 11999 }));
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_new", plan: "PLUS" }),
    );

    await POST(webhook(withId("subscription.renewed", "evt_2")));

    expect(prismaMock.billingEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventId: "evt_2",
        type: "renewed",
        plan: "PLUS",
        amount: 11999,
      }),
    });
  });

  it("cancelamento registra sem valor", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote({ status: "CANCELLED" }));
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_new" }),
    );

    await POST(webhook(withId("subscription.cancelled", "evt_3")));

    expect(prismaMock.billingEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ type: "cancelled", amount: null }),
    });
  });

  it("evento repetido (mesmo ID) é ignorado por completo", async () => {
    prismaMock.billingEvent.findUnique.mockResolvedValue({ id: "ja-visto" });

    const res = await POST(webhook(withId("subscription.renewed", "evt_2")));

    expect(res.status).toBe(200);
    expect(prismaMock.billingEvent.findUnique).toHaveBeenCalledWith({
      where: { eventId: "evt_2" },
      select: { id: true },
    });
    expect(getSubscription).not.toHaveBeenCalled();
    expect(prismaMock.subscription.update).not.toHaveBeenCalled();
  });

  it("sem ID de evento não consulta duplicidade", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());

    await POST(webhook(withId("subscription.completed")));

    expect(prismaMock.billingEvent.findUnique).not.toHaveBeenCalled();
  });

  it("não registra quando o webhook de assinatura repete (mesmo ID de assinatura)", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(
      row({ abacatepaySubscriptionId: "subs_new" }),
    );

    await POST(webhook(withId("subscription.completed")));

    expect(prismaMock.billingEvent.create).not.toHaveBeenCalled();
  });

  it("não registra eventos ignorados", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote({ status: "PENDING" }));
    prismaMock.subscription.findUnique.mockResolvedValue(row());

    await POST(webhook(withId("subscription.completed")));

    expect(prismaMock.billingEvent.create).not.toHaveBeenCalled();
  });

  it("falha ao gravar o histórico não derruba o webhook", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockResolvedValue(row());
    prismaMock.billingEvent.create.mockRejectedValue(new Error("unique"));

    const res = await POST(webhook(withId("subscription.completed", "evt_9")));

    expect(res.status).toBe(200);
    expect(sendEmail).toHaveBeenCalled();
  });
});

describe("falhas internas", () => {
  it("devolve 500 para a AbacatePay tentar de novo quando a API cai", async () => {
    vi.mocked(getSubscription).mockRejectedValue(new Error("timeout"));

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(500);
  });

  it("devolve 500 quando o banco falha", async () => {
    vi.mocked(getSubscription).mockResolvedValue(remote());
    prismaMock.subscription.findUnique.mockRejectedValue(new Error("db"));

    const res = await POST(webhook(event("subscription.completed")));

    expect(res.status).toBe(500);
  });
});
