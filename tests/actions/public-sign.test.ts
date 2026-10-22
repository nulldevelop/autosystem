import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));

import { signBudget } from "@/app/(public)/budget/sign/[id]/_actions/sign-budget";
import { signServiceOrder } from "@/app/(public)/service/sign/_actions/sign-service-order";

beforeEach(() => {
  resetPrismaMock();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("signBudget (link público)", () => {
  const budget = {
    id: "b1",
    organizationId: "org-A",
    customerId: "c1",
    totalAmount: 1500,
    customer: { name: "Maria" },
    vehicle: { marca: "Fiat", model: "Uno" },
  };

  it("assina só orçamento pendente e ainda não assinado", async () => {
    prismaMock.budget.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.budget.findUniqueOrThrow.mockResolvedValue(budget);

    const result = await signBudget("b1", "data:image/png;base64,AAA");

    expect(result).toEqual({ success: true });
    expect(prismaMock.budget.updateMany).toHaveBeenCalledWith({
      where: { id: "b1", signedAt: null, status: "pending" },
      data: {
        signature: "data:image/png;base64,AAA",
        signedAt: expect.any(Date),
        status: "aproved",
      },
    });
  });

  it("notifica a oficina dona do orçamento", async () => {
    prismaMock.budget.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.budget.findUniqueOrThrow.mockResolvedValue(budget);

    await signBudget("b1", "sig");

    const { data } = prismaMock.notification.create.mock.calls[0][0];
    expect(data).toMatchObject({
      type: "BUDGET_SIGNED",
      organizationId: "org-A",
      budgetId: "b1",
      customerId: "c1",
    });
    expect(data.message).toContain("Maria");
    expect(data.message).toContain("Fiat Uno");
  });

  it("não reescreve a assinatura de um orçamento já assinado/aprovado", async () => {
    prismaMock.budget.updateMany.mockResolvedValue({ count: 0 });

    const result = await signBudget("b1", "outra-assinatura");

    expect(result).toEqual({
      success: false,
      error: "Este orçamento não pode mais ser assinado",
    });
    expect(prismaMock.notification.create).not.toHaveBeenCalled();
  });

  it("orçamento sem oficina não gera notificação", async () => {
    prismaMock.budget.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.budget.findUniqueOrThrow.mockResolvedValue({
      ...budget,
      organizationId: null,
      customer: null,
    });

    await expect(signBudget("b1", "sig")).resolves.toEqual({ success: true });
    expect(prismaMock.notification.create).not.toHaveBeenCalled();
  });

  it("usa 'Cliente' quando o cliente não tem nome", async () => {
    prismaMock.budget.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.budget.findUniqueOrThrow.mockResolvedValue({
      ...budget,
      customer: null,
    });

    await signBudget("b1", "sig");

    expect(prismaMock.notification.create.mock.calls[0][0].data.message).toContain(
      "Cliente",
    );
  });

  it("falha do banco vira erro amigável", async () => {
    prismaMock.budget.updateMany.mockRejectedValue(new Error("db"));

    await expect(signBudget("b1", "sig")).resolves.toEqual({
      success: false,
      error: "Falha ao processar assinatura",
    });
  });
});

describe("signServiceOrder (link público)", () => {
  const order = {
    id: "os1",
    organizationId: "org-A",
    customerId: "c1",
    customer: { name: "João" },
    vehicle: { marca: "VW", model: "Gol" },
  };

  it("assina só O.S. aberta e ainda não assinada, e passa para em andamento", async () => {
    prismaMock.serviceOrder.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.serviceOrder.findUniqueOrThrow.mockResolvedValue(order);

    const result = await signServiceOrder("os1", "sig");

    expect(result).toEqual({
      success: true,
      message: "Ordem de serviço assinado com sucesso!",
    });
    expect(prismaMock.serviceOrder.updateMany).toHaveBeenCalledWith({
      where: { id: "os1", signedAt: null, status: "open" },
      data: { signature: "sig", signedAt: expect.any(Date), status: "in_progress" },
    });
  });

  it("notifica a oficina dona da O.S.", async () => {
    prismaMock.serviceOrder.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.serviceOrder.findUniqueOrThrow.mockResolvedValue(order);

    await signServiceOrder("os1", "sig");

    expect(prismaMock.notification.create.mock.calls[0][0].data).toMatchObject({
      type: "SERVICE_ORDER_SIGNED",
      organizationId: "org-A",
      serviceOrderId: "os1",
    });
  });

  it("não assina O.S. já assinada, concluída ou cancelada", async () => {
    prismaMock.serviceOrder.updateMany.mockResolvedValue({ count: 0 });

    const result = await signServiceOrder("os1", "sig");

    expect(result).toEqual({
      success: false,
      message: "Esta ordem de serviço não pode mais ser assinada.",
    });
    expect(prismaMock.notification.create).not.toHaveBeenCalled();
  });

  it("O.S. sem oficina não gera notificação", async () => {
    prismaMock.serviceOrder.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.serviceOrder.findUniqueOrThrow.mockResolvedValue({
      ...order,
      organizationId: null,
      customer: null,
    });

    await expect(signServiceOrder("os1", "sig")).resolves.toMatchObject({
      success: true,
    });
    expect(prismaMock.notification.create).not.toHaveBeenCalled();
  });

  it("falha do banco vira erro amigável", async () => {
    prismaMock.serviceOrder.updateMany.mockRejectedValue(new Error("db"));

    await expect(signServiceOrder("os1", "sig")).resolves.toEqual({
      success: false,
      message: "Erro ao salvar assinatura.",
    });
  });
});
