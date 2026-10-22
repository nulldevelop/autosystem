import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { signUpEmail: vi.fn() } },
}));
vi.mock("@/lib/referral", () => ({ attachReferrer: vi.fn() }));

import { signUp } from "@/app/(public)/_actions/sign-up";
import { auth } from "@/lib/auth";
import { attachReferrer } from "@/lib/referral";

const signUpEmail = vi.mocked(auth.api.signUpEmail) as unknown as ReturnType<
  typeof vi.fn
>;

const valid = {
  name: "Maria Silva",
  email: "  Maria@Example.COM ",
  password: "Senha123",
};

beforeEach(() => {
  signUpEmail.mockReset();
  vi.mocked(attachReferrer).mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("validação", () => {
  it.each([
    ["nome curto", { ...valid, name: "Ma" }, "name"],
    ["e-mail inválido", { ...valid, email: "nao-e-email" }, "email"],
    ["senha curta", { ...valid, password: "Aa1" }, "password"],
    ["senha sem maiúscula", { ...valid, password: "senha1234" }, "password"],
    ["senha sem minúscula", { ...valid, password: "SENHA1234" }, "password"],
    ["senha sem número", { ...valid, password: "SenhaSenha" }, "password"],
  ])("recusa %s", async (_label, input, field) => {
    const result = await signUp(input);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe("Dados de cadastro inválidos.");
      expect(result.error.fieldErrors).toHaveProperty(field);
    }
    expect(signUpEmail).not.toHaveBeenCalled();
  });

  it("recusa entrada que não é objeto", async () => {
    const result = await signUp(null);
    expect(result.success).toBe(false);
  });
});

describe("cadastro", () => {
  it("normaliza o e-mail e pede o retorno ao dashboard", async () => {
    signUpEmail.mockResolvedValue({});

    const result = await signUp(valid);

    expect(result).toEqual({ success: true, message: "Conta criada com sucesso!" });
    expect(signUpEmail).toHaveBeenCalledWith({
      body: {
        name: "Maria Silva",
        email: "maria@example.com",
        password: "Senha123",
        callbackURL: "/dashboard",
      },
    });
  });

  it("sem código de indicação não consulta indicador", async () => {
    signUpEmail.mockResolvedValue({});
    await signUp(valid);
    expect(attachReferrer).not.toHaveBeenCalled();
  });

  it("vincula o indicador usando o e-mail normalizado", async () => {
    signUpEmail.mockResolvedValue({});

    await signUp({ ...valid, referralCode: " ABC123 " });

    expect(attachReferrer).toHaveBeenCalledWith("maria@example.com", "ABC123");
  });

  it("falha ao vincular indicação não impede o cadastro", async () => {
    signUpEmail.mockResolvedValue({});
    vi.mocked(attachReferrer).mockRejectedValue(new Error("db"));

    const result = await signUp({ ...valid, referralCode: "ABC123" });

    expect(result.success).toBe(true);
  });

  it("não vincula indicador quando o cadastro falha", async () => {
    signUpEmail.mockRejectedValue(new Error("boom"));

    await signUp({ ...valid, referralCode: "ABC123" });

    expect(attachReferrer).not.toHaveBeenCalled();
  });
});

describe("erros do cadastro", () => {
  it.each(["User already exists", "Usuário já existe"])(
    "e-mail repetido (%s)",
    async (message) => {
      signUpEmail.mockRejectedValue(new Error(message));

      const result = await signUp(valid);

      expect(result).toEqual({
        success: false,
        error: { message: "Este e-mail já está cadastrado." },
      });
    },
  );

  it("outro erro conhecido vira mensagem genérica", async () => {
    signUpEmail.mockRejectedValue(new Error("timeout"));

    const result = await signUp(valid);

    expect(result).toEqual({
      success: false,
      error: { message: "Não foi possível criar a conta. Tente novamente." },
    });
  });

  it("erro que não é Error vira mensagem inesperada", async () => {
    signUpEmail.mockRejectedValue("string solta");

    const result = await signUp(valid);

    expect(result).toEqual({
      success: false,
      error: { message: "Ocorreu um erro inesperado ao criar a conta." },
    });
  });
});
