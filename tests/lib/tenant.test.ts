import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));
vi.mock("@/lib/getSession", () => ({ getSession: vi.fn() }));

import { getSession } from "@/lib/getSession";
import {
  TenantError,
  getTenant,
  requireTenant,
  scopeQueryArgs,
  tenantDb,
} from "@/lib/tenant";

const ORG = "org-A";

describe("scopeQueryArgs: modelos com organizationId", () => {
  const DIRECT = [
    "Customer",
    "Vehicle",
    "Budget",
    "Product",
    "ServiceOrder",
    "Transaction",
    "Notification",
  ];

  describe.each(DIRECT)("%s", (model) => {
    it("leituras em lista ganham o filtro da oficina", () => {
      expect(scopeQueryArgs(model, "findMany", undefined, ORG)).toEqual({
        where: { organizationId: ORG },
      });
    });

    it("preserva o where do chamador dentro de um AND", () => {
      const args = { where: { name: "x" }, take: 5 };
      expect(scopeQueryArgs(model, "findMany", args, ORG)).toEqual({
        where: { AND: [{ name: "x" }, { organizationId: ORG }] },
        take: 5,
      });
    });

    it.each(["findFirst", "findFirstOrThrow", "count", "aggregate", "groupBy"])(
      "%s é filtrado",
      (operation) => {
        const result = scopeQueryArgs(model, operation, { where: { id: "1" } }, ORG);
        expect(result?.where).toEqual({
          AND: [{ id: "1" }, { organizationId: ORG }],
        });
      },
    );

    it.each(["updateMany", "deleteMany"])("%s não alcança outras oficinas", (operation) => {
      const result = scopeQueryArgs(model, operation, { where: { read: false } }, ORG);
      expect(result?.where).toEqual({
        AND: [{ read: false }, { organizationId: ORG }],
      });
    });

    it.each(["findUnique", "findUniqueOrThrow", "update", "delete"])(
      "%s mantém a chave única e acrescenta a oficina",
      (operation) => {
        const result = scopeQueryArgs(model, operation, { where: { id: "1" } }, ORG);
        expect(result?.where).toEqual({ id: "1", organizationId: ORG });
      },
    );

    it("um organizationId de outra oficina no where é sobrescrito", () => {
      const result = scopeQueryArgs(
        model,
        "findUnique",
        { where: { id: "1", organizationId: "org-B" } },
        ORG,
      );
      expect(result?.where).toEqual({ id: "1", organizationId: ORG });
    });

    it("create força o organizationId", () => {
      const result = scopeQueryArgs(
        model,
        "create",
        { data: { name: "x", organizationId: "org-B" } },
        ORG,
      );
      expect(result?.data).toEqual({ name: "x", organizationId: ORG });
    });

    it("createMany força o organizationId em cada linha", () => {
      const result = scopeQueryArgs(
        model,
        "createMany",
        { data: [{ n: 1 }, { n: 2, organizationId: "org-B" }] },
        ORG,
      );
      expect(result?.data).toEqual([
        { n: 1, organizationId: ORG },
        { n: 2, organizationId: ORG },
      ]);
    });

    it("update não deixa mover o registro para outra oficina", () => {
      const result = scopeQueryArgs(
        model,
        "update",
        { where: { id: "1" }, data: { name: "x", organizationId: "org-B" } },
        ORG,
      );
      expect(result?.data).toEqual({ name: "x" });
    });

    it("upsert restringe where, create e update", () => {
      const result = scopeQueryArgs(
        model,
        "upsert",
        {
          where: { id: "1" },
          create: { name: "novo" },
          update: { name: "velho", organizationId: "org-B" },
        },
        ORG,
      );
      expect(result).toEqual({
        where: { id: "1", organizationId: ORG },
        create: { name: "novo", organizationId: ORG },
        update: { name: "velho" },
      });
    });
  });

  it("createMany aceita um objeto único de dados", () => {
    expect(
      scopeQueryArgs("Customer", "createMany", { data: { n: 1 } }, ORG)?.data,
    ).toEqual({ n: 1, organizationId: ORG });
  });

  it("update sem data não quebra", () => {
    expect(
      scopeQueryArgs("Customer", "update", { where: { id: "1" } }, ORG),
    ).toEqual({ where: { id: "1", organizationId: ORG }, data: undefined });
  });

  it("não altera os argumentos originais", () => {
    const args = { where: { id: "1" }, data: { organizationId: "org-B" } };
    const snapshot = JSON.parse(JSON.stringify(args));
    scopeQueryArgs("Budget", "update", args, ORG);
    expect(args).toEqual(snapshot);
  });
});

describe("scopeQueryArgs: modelos filhos", () => {
  it.each([
    ["BudgetItem", { budget: { organizationId: ORG } }],
    ["BudgetPhoto", { budget: { organizationId: ORG } }],
    ["ServiceOrderItem", { serviceOrder: { organizationId: ORG } }],
    ["ProductMovement", { product: { organizationId: ORG } }],
  ])("%s é filtrado pela oficina do pai", (model, filter) => {
    expect(scopeQueryArgs(model, "findMany", undefined, ORG)).toEqual({
      where: filter,
    });
    expect(
      scopeQueryArgs(model, "findMany", { where: { id: "1" } }, ORG)?.where,
    ).toEqual({ AND: [{ id: "1" }, filter] });
    expect(
      scopeQueryArgs(model, "delete", { where: { id: "1" } }, ORG)?.where,
    ).toEqual({ id: "1", ...filter });
  });

  it("não injeta organizationId em criações de filhos", () => {
    const args = { data: { budgetId: "b1", url: "u" } };
    expect(scopeQueryArgs("BudgetPhoto", "create", args, ORG)).toEqual(args);
  });
});

describe("scopeQueryArgs: modelos fora do escopo", () => {
  it.each(["User", "Session", "Account", "Subscription", "Organization", "Member"])(
    "%s passa sem alteração",
    (model) => {
      const args = { where: { id: "1" } };
      expect(scopeQueryArgs(model, "findMany", args, ORG)).toBe(args);
    },
  );

  it("operações desconhecidas mantêm o where", () => {
    expect(
      scopeQueryArgs("Customer", "somethingElse", { where: { id: "1" } }, ORG),
    ).toEqual({ where: { id: "1" } });
  });
});

describe("tenantDb", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("registra uma extensão de query para todos os modelos", () => {
    prismaMock.$extends.mockReturnValue("client-estendido");

    const db = tenantDb(ORG);

    expect(db).toBe("client-estendido");
    const config = prismaMock.$extends.mock.calls[0][0];
    expect(config.name).toBe("tenant-scope");
    expect(config.query.$allModels.$allOperations).toBeTypeOf("function");
  });

  it("a extensão reescreve os argumentos antes de executar a query", async () => {
    prismaMock.$extends.mockReturnValue({});
    tenantDb(ORG);
    const { $allOperations } = prismaMock.$extends.mock.calls[0][0].query.$allModels;
    const query = vi.fn(async (args: unknown) => args);

    const result = await $allOperations({
      model: "Customer",
      operation: "findMany",
      args: { where: { name: "x" } },
      query,
    });

    expect(query).toHaveBeenCalledWith({
      where: { AND: [{ name: "x" }, { organizationId: ORG }] },
    });
    expect(result).toEqual({
      where: { AND: [{ name: "x" }, { organizationId: ORG }] },
    });
  });
});

describe("requireTenant / getTenant", () => {
  const session = {
    user: { id: "user-1" },
    session: { activeOrganizationId: ORG },
  };

  beforeEach(() => {
    resetPrismaMock();
    vi.mocked(getSession).mockReset();
    prismaMock.$extends.mockReturnValue({ marker: "db" });
  });

  it("UNAUTHORIZED sem sessão", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    await expect(requireTenant()).rejects.toMatchObject({
      name: "TenantError",
      code: "UNAUTHORIZED",
    });
  });

  it("ORGANIZATION_REQUIRED sem oficina ativa", async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: "user-1" },
      session: { activeOrganizationId: null },
    } as never);
    await expect(requireTenant()).rejects.toMatchObject({
      code: "ORGANIZATION_REQUIRED",
    });
  });

  it("FORBIDDEN quando o usuário não é membro da oficina ativa", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.member.findFirst.mockResolvedValue(null);

    await expect(requireTenant()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(prismaMock.member.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", organizationId: ORG },
      select: { role: true },
    });
  });

  it("devolve usuário, oficina, papel e o db restrito", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.member.findFirst.mockResolvedValue({ role: "owner" });

    const tenant = await requireTenant();

    expect(tenant).toEqual({
      userId: "user-1",
      organizationId: ORG,
      role: "owner",
      db: { marker: "db" },
    });
  });

  it("getTenant devolve null nos casos de TenantError", async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    await expect(getTenant()).resolves.toBeNull();

    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.member.findFirst.mockResolvedValue(null);
    await expect(getTenant()).resolves.toBeNull();
  });

  it("getTenant devolve o tenant quando tudo está certo", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.member.findFirst.mockResolvedValue({ role: "member" });

    await expect(getTenant()).resolves.toMatchObject({ organizationId: ORG });
  });

  it("getTenant propaga erros inesperados", async () => {
    vi.mocked(getSession).mockResolvedValue(session as never);
    prismaMock.member.findFirst.mockRejectedValue(new Error("db caiu"));

    await expect(getTenant()).rejects.toThrow("db caiu");
  });

  it("TenantError carrega código e mensagem em português", () => {
    const error = new TenantError("FORBIDDEN");
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("FORBIDDEN");
    expect(error.message).toBe("Você não tem acesso a esta oficina.");
  });
});
