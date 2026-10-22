import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock, resetPrismaMock } from "../mocks/prisma";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("@/lib/prisma", async () => ({
  prisma: (await import("../mocks/prisma")).prismaMock,
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn(), checkOrganizationSlug: vi.fn() } },
}));

import {
  checkOrganizationSlug,
  createOrganization,
  updateOrganizationData,
  updateOrganizationLogo,
} from "@/app/(auth)/dashboard/_actions/create-organization";
import { auth } from "@/lib/auth";

const getSession = vi.mocked(auth.api.getSession) as unknown as ReturnType<typeof vi.fn>;
const checkSlug = vi.mocked(auth.api.checkOrganizationSlug) as unknown as ReturnType<
  typeof vi.fn
>;

const valid = {
  name: "Oficina Teste",
  slug: "meu-negocio",
  address: "Rua A, 10 - Centro",
  phone: "11999999999",
  cnpj: "11222333000181",
};

beforeEach(() => {
  resetPrismaMock();
  getSession.mockReset();
  checkSlug.mockReset();
  getSession.mockResolvedValue({
    user: { id: "user-1" },
    session: { id: "sess-1" },
  });
  prismaMock.organization.findUnique.mockResolvedValue(null);
  prismaMock.organization.create.mockResolvedValue({ id: "org-1" });
  // por padrão o usuário é dono da oficina que está editando
  prismaMock.member.findFirst.mockResolvedValue({ id: "m1" });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("createOrganization: validação", () => {
  it.each([
    ["nome curto", { name: "A" }, "O nome da oficina deve ter pelo menos 2 caracteres."],
    ["slug com maiúscula", { slug: "Meu" }, "O slug deve conter apenas letras minúsculas, números e hífens."],
    ["endereço curto", { address: "A" }, "O endereço deve ter pelo menos 2 caracteres."],
    ["telefone curto", { phone: "1199" }, "O telefone deve ter pelo menos 11 caracteres."],
    ["CNPJ inválido", { cnpj: "11222333000182" }, "CNPJ inválido."],
    ["CNPJ de números repetidos", { cnpj: "00000000000000" }, "CNPJ inválido."],
  ])("recusa %s com a mensagem do campo", async (_label, override, message) => {
    const result = await createOrganization({ ...valid, ...override });

    expect(result).toEqual({ success: false, message });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("aceita logo vazio e recusa logo que não é URL", async () => {
    const ok = await createOrganization({ ...valid, logo: "" });
    expect(ok.success).toBe(true);

    const bad = await createOrganization({ ...valid, logo: "não é url" });
    expect(bad.success).toBe(false);
  });
});

describe("createOrganization: autenticação", () => {
  it("exige sessão", async () => {
    getSession.mockResolvedValue(null);

    const result = await createOrganization(valid);

    expect(result).toEqual({
      success: false,
      message: "Você precisa estar autenticado para criar uma oficina.",
    });
    expect(prismaMock.organization.create).not.toHaveBeenCalled();
  });
});

describe("createOrganization: criação", () => {
  it("cria oficina, dono e sessão ativa numa única transação", async () => {
    const result = await createOrganization(valid);

    expect(result).toEqual({
      success: true,
      message: "Oficina criada com sucesso!",
      organizationId: "org-1",
    });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.organization.create.mock.calls[0][0].data).toMatchObject({
      name: "Oficina Teste",
      slug: "meu-negocio",
      cnpj: "11222333000181",
      logo: null,
    });
    expect(prismaMock.member.create.mock.calls[0][0].data).toMatchObject({
      organizationId: "org-1",
      userId: "user-1",
      role: "owner",
    });
    expect(prismaMock.session.update).toHaveBeenCalledWith({
      where: { id: "sess-1" },
      data: { activeOrganizationId: "org-1" },
    });
  });

  it("guarda a URL do logo quando informada", async () => {
    await createOrganization({ ...valid, logo: "https://cdn.test/logo.png" });

    expect(prismaMock.organization.create.mock.calls[0][0].data.logo).toBe(
      "https://cdn.test/logo.png",
    );
  });

  it("slug já usado ganha um sufixo curto", async () => {
    prismaMock.organization.findUnique
      .mockResolvedValueOnce({ id: "outra" })
      .mockResolvedValueOnce(null);

    await createOrganization(valid);

    const slug = prismaMock.organization.create.mock.calls[0][0].data.slug;
    expect(slug).toMatch(/^meu-negocio-[0-9a-f]{4}$/);
  });

  it("continua sufixando enquanto o slug estiver ocupado", async () => {
    prismaMock.organization.findUnique
      .mockResolvedValueOnce({ id: "1" })
      .mockResolvedValueOnce({ id: "2" })
      .mockResolvedValueOnce(null);

    await createOrganization(valid);

    expect(prismaMock.organization.findUnique).toHaveBeenCalledTimes(3);
  });

  it("sem id de sessão não tenta atualizar a sessão", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" }, session: {} });

    const result = await createOrganization(valid);

    expect(result.success).toBe(true);
    expect(prismaMock.session.update).not.toHaveBeenCalled();
  });
});

describe("createOrganization: erros", () => {
  it.each([
    [{ code: "P2002", message: "x" }, "Este slug já está em uso. Escolha outro."],
    [{ message: "membership limit reached" }, "Você atingiu o limite de oficinas permitidas."],
    [{ status: 401, message: "x" }, "Você precisa estar autenticado para criar uma oficina."],
    [{ statusCode: 401, message: "x" }, "Você precisa estar autenticado para criar uma oficina."],
    [{ status: 403, message: "x" }, "Você não tem permissão para criar uma oficina."],
    [{ statusCode: 403, message: "x" }, "Você não tem permissão para criar uma oficina."],
    [{ message: "falha estranha" }, "falha estranha"],
    [{}, "Ocorreu um erro ao criar a oficina."],
  ])("traduz %o", async (error, message) => {
    prismaMock.$transaction.mockRejectedValue(error);

    const result = await createOrganization(valid);

    expect(result).toEqual({ success: false, message });
  });
});

describe("checkOrganizationSlug", () => {
  it("disponível", async () => {
    checkSlug.mockResolvedValue({ status: true });
    await expect(checkOrganizationSlug("novo")).resolves.toEqual({
      available: true,
      message: undefined,
    });
  });

  it("em uso", async () => {
    checkSlug.mockResolvedValue({ status: false });
    await expect(checkOrganizationSlug("usado")).resolves.toEqual({
      available: false,
      message: "Este slug já está em uso",
    });
  });

  it("erro na verificação", async () => {
    checkSlug.mockRejectedValue(new Error("x"));
    await expect(checkOrganizationSlug("x")).resolves.toEqual({
      available: false,
      message: "Erro ao verificar disponibilidade do slug",
    });
  });
});

describe("proteção contra edição de outra oficina (IDOR)", () => {
  const data = {
    name: "Invasor",
    phone: "11999999999",
    cnpj: "11222333000181",
    address: "Rua X",
  };

  it("sem sessão nada é alterado", async () => {
    getSession.mockResolvedValue(null);

    await expect(updateOrganizationLogo("org-alvo", "x")).resolves.toEqual({
      success: false,
    });
    await expect(updateOrganizationData("org-alvo", data)).resolves.toEqual({
      success: false,
      message: "Você não tem permissão para alterar esta oficina.",
    });
    expect(prismaMock.organization.update).not.toHaveBeenCalled();
  });

  it("quem não é dono/admin da oficina informada não consegue alterar", async () => {
    prismaMock.member.findFirst.mockResolvedValue(null);

    await expect(updateOrganizationLogo("org-alvo", "x")).resolves.toEqual({
      success: false,
    });
    await expect(updateOrganizationData("org-alvo", data)).resolves.toMatchObject({
      success: false,
    });
    expect(prismaMock.organization.update).not.toHaveBeenCalled();
  });

  it("a checagem é feita na oficina do parâmetro, só para owner/admin", async () => {
    prismaMock.organization.update.mockResolvedValue({});

    await updateOrganizationLogo("org-alvo", "x");

    expect(prismaMock.member.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        organizationId: "org-alvo",
        role: { in: ["owner", "admin"] },
      },
      select: { id: true },
    });
  });
});

describe("updateOrganizationLogo", () => {
  it("atualiza o logo", async () => {
    prismaMock.organization.update.mockResolvedValue({});

    await expect(updateOrganizationLogo("org-1", "/api/storage/x.png")).resolves.toEqual({
      success: true,
    });
    expect(prismaMock.organization.update).toHaveBeenCalledWith({
      where: { id: "org-1" },
      data: { logo: "/api/storage/x.png" },
    });
  });

  it("falha do banco", async () => {
    prismaMock.organization.update.mockRejectedValue(new Error("db"));
    await expect(updateOrganizationLogo("org-1", "x")).resolves.toEqual({
      success: false,
    });
  });
});

describe("updateOrganizationData", () => {
  const data = {
    name: "Oficina Nova",
    phone: "11999999999",
    cnpj: "11.222.333/0001-81",
    address: "Rua B, 20",
  };

  it("recusa CNPJ inválido sem tocar no banco", async () => {
    const result = await updateOrganizationData("org-1", {
      ...data,
      cnpj: "11.222.333/0001-80",
    });

    expect(result).toEqual({ success: false, message: "CNPJ inválido." });
    expect(prismaMock.organization.update).not.toHaveBeenCalled();
  });

  it("atualiza com CNPJ válido (com ou sem máscara)", async () => {
    prismaMock.organization.update.mockResolvedValue({});

    const result = await updateOrganizationData("org-1", data);

    expect(result).toEqual({
      success: true,
      message: "Dados atualizados com sucesso!",
    });
    expect(prismaMock.organization.update).toHaveBeenCalledWith({
      where: { id: "org-1" },
      data: {
        name: "Oficina Nova",
        phone: "11999999999",
        cnpj: "11.222.333/0001-81",
        address: "Rua B, 20",
      },
    });
  });

  it("falha do banco", async () => {
    prismaMock.organization.update.mockRejectedValue(new Error("db"));

    await expect(updateOrganizationData("org-1", data)).resolves.toEqual({
      success: false,
      message: "Erro ao atualizar dados.",
    });
  });
});
