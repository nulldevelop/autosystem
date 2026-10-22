import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));
vi.mock("@/lib/tenant", async () => {
  const actual = await vi.importActual<typeof import("@/lib/tenant")>(
    "@/lib/tenant",
  );
  return { ...actual, requireTenant: vi.fn(), getTenant: vi.fn() };
});

import { markAllNotificationsAsRead, markNotificationAsRead } from "@/app/(auth)/dashboard/_actions/notifications";
import { getVehiclesCount } from "@/app/(auth)/dashboard/_data-access/get-vehicles-count";
import { deleteCustomer } from "@/app/(auth)/dashboard/customer/_actions/delete-customer";
import { getProductsCount } from "@/app/(auth)/dashboard/product/_data-access/get-products-count";
import { getServiceOrdersCount } from "@/app/(auth)/dashboard/service/_data-access/get-service-orders-count";
import { deleteVehicle } from "@/app/(auth)/dashboard/vehicle/_actions/delete-vehicle";
import { TenantError, getTenant, requireTenant } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

// db falso: cada modelo expõe os métodos usados pelas ações
const db = {
  customer: { findUnique: vi.fn(), delete: vi.fn() },
  vehicle: { findUnique: vi.fn(), delete: vi.fn(), count: vi.fn() },
  notification: { updateMany: vi.fn() },
  product: { findMany: vi.fn() },
  serviceOrder: { count: vi.fn() },
};

const tenant = { userId: "u1", organizationId: "org-A", role: "owner", db };

function resetDb() {
  for (const model of Object.values(db)) {
    for (const fn of Object.values(model)) fn.mockReset();
  }
}

beforeEach(() => {
  resetDb();
  vi.mocked(requireTenant).mockReset();
  vi.mocked(getTenant).mockReset();
  vi.mocked(revalidatePath).mockReset();
  vi.mocked(requireTenant).mockResolvedValue(tenant as never);
  vi.mocked(getTenant).mockResolvedValue(tenant as never);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe.each([
  {
    label: "deleteCustomer",
    run: (id: string) => deleteCustomer(id),
    model: db.customer,
    path: "/dashboard/customer",
    notFound: "Cliente não encontrado.",
    blocked:
      "Não é possível excluir um cliente com histórico de orçamentos ou ordens de serviço.",
    ok: "Cliente removido com sucesso!",
    internal: "Erro interno ao tentar excluir o cliente.",
  },
  {
    label: "deleteVehicle",
    run: (id: string) => deleteVehicle(id),
    model: db.vehicle,
    path: "/dashboard/vehicle",
    notFound: "Veículo não encontrado.",
    blocked:
      "Não é possível excluir um veículo com histórico de orçamentos ou ordens de serviço.",
    ok: "Veículo removido com sucesso!",
    internal: "Erro interno ao tentar excluir o veículo.",
  },
])("$label", ({ run, model, path, notFound, blocked, ok, internal }) => {
  it("exige sessão e oficina: sem tenant nada é apagado", async () => {
    vi.mocked(requireTenant).mockRejectedValue(new TenantError("UNAUTHORIZED"));

    const result = await run("id-1");

    expect(result).toEqual({
      success: false,
      message: "Você precisa estar autenticado.",
    });
    expect(model.findUnique).not.toHaveBeenCalled();
    expect(model.delete).not.toHaveBeenCalled();
  });

  it("recusa quem não é membro da oficina ativa", async () => {
    vi.mocked(requireTenant).mockRejectedValue(new TenantError("FORBIDDEN"));

    const result = await run("id-1");

    expect(result.success).toBe(false);
    expect(model.delete).not.toHaveBeenCalled();
  });

  it("registro de outra oficina parece não existir (o db restrito não o enxerga)", async () => {
    model.findUnique.mockResolvedValue(null);

    const result = await run("id-de-outra-oficina");

    expect(result).toEqual({ success: false, message: notFound });
    expect(model.delete).not.toHaveBeenCalled();
  });

  it.each([
    [{ budgets: 1, serviceOrders: 0 }],
    [{ budgets: 0, serviceOrders: 3 }],
  ])("bloqueia a exclusão quando há histórico %o", async (count) => {
    model.findUnique.mockResolvedValue({ _count: count });

    const result = await run("id-1");

    expect(result).toEqual({ success: false, message: blocked });
    expect(model.delete).not.toHaveBeenCalled();
  });

  it("exclui e revalida a lista quando está tudo certo", async () => {
    model.findUnique.mockResolvedValue({
      _count: { budgets: 0, serviceOrders: 0 },
    });
    model.delete.mockResolvedValue({});

    const result = await run("id-1");

    expect(result).toEqual({ success: true, message: ok });
    expect(model.delete).toHaveBeenCalledWith({ where: { id: "id-1" } });
    expect(revalidatePath).toHaveBeenCalledWith(path);
  });

  it("erro inesperado vira mensagem genérica", async () => {
    model.findUnique.mockRejectedValue(new Error("db"));

    await expect(run("id-1")).resolves.toEqual({
      success: false,
      message: internal,
    });
  });
});

describe("notificações", () => {
  it("marcar uma como lida usa o db da oficina e ignora ids de outras", async () => {
    db.notification.updateMany.mockResolvedValue({ count: 1 });

    const result = await markNotificationAsRead("n-1");

    expect(result).toEqual({ success: true });
    expect(db.notification.updateMany).toHaveBeenCalledWith({
      where: { id: "n-1" },
      data: { read: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/notifications");
  });

  it("marcar todas como lidas não aceita oficina vinda do cliente", async () => {
    db.notification.updateMany.mockResolvedValue({ count: 4 });

    // a função não recebe mais organizationId: não há como apontar para outra oficina
    expect(markAllNotificationsAsRead.length).toBe(0);
    const result = await markAllNotificationsAsRead();

    expect(result).toEqual({ success: true });
    expect(db.notification.updateMany).toHaveBeenCalledWith({
      where: { read: false },
      data: { read: true },
    });
  });

  it.each([
    ["markNotificationAsRead", () => markNotificationAsRead("n-1")],
    ["markAllNotificationsAsRead", () => markAllNotificationsAsRead()],
  ])("%s falha sem sessão", async (_name, run) => {
    vi.mocked(requireTenant).mockRejectedValue(new TenantError("UNAUTHORIZED"));

    const result = await run();

    expect(result).toEqual({
      success: false,
      error: "Você precisa estar autenticado.",
    });
    expect(db.notification.updateMany).not.toHaveBeenCalled();
  });

  it("erros do banco viram mensagem genérica", async () => {
    db.notification.updateMany.mockRejectedValue(new Error("db"));

    await expect(markNotificationAsRead("n-1")).resolves.toEqual({
      success: false,
      error: "Falha ao atualizar a notificação",
    });
    await expect(markAllNotificationsAsRead()).resolves.toEqual({
      success: false,
      error: "Falha ao atualizar as notificações",
    });
  });
});

describe("contagens da oficina", () => {
  it("não recebem oficina por parâmetro", () => {
    expect(getVehiclesCount.length).toBe(0);
    expect(getProductsCount.length).toBe(0);
    expect(getServiceOrdersCount.length).toBe(0);
  });

  it("devolvem 0 sem sessão/oficina", async () => {
    vi.mocked(getTenant).mockResolvedValue(null);

    await expect(getVehiclesCount()).resolves.toBe(0);
    await expect(getProductsCount()).resolves.toBe(0);
    await expect(getServiceOrdersCount()).resolves.toBe(0);
    expect(db.vehicle.count).not.toHaveBeenCalled();
  });

  it("contam usando o db restrito", async () => {
    db.vehicle.count.mockResolvedValue(7);
    db.serviceOrder.count.mockResolvedValue(3);

    await expect(getVehiclesCount()).resolves.toBe(7);
    await expect(getServiceOrdersCount()).resolves.toBe(3);
    expect(db.vehicle.count).toHaveBeenCalledWith();
  });

  it("produtos ignoram os itens avulsos criados em orçamentos", async () => {
    db.product.findMany.mockResolvedValue([
      { sku: "PECA-1" },
      { sku: "CUSTOM-123" },
      { sku: "GENERIC-CUSTOM-9" },
      { sku: "OLEO-5W30" },
    ]);

    await expect(getProductsCount()).resolves.toBe(2);
    expect(db.product.findMany).toHaveBeenCalledWith({ select: { sku: true } });
  });
});
