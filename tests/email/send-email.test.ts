import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

async function loadEmailModule(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  vi.doMock("resend", () => ({
    Resend: class {
      emails = { send: sendMock };
    },
  }));
  return import("@/lib/email");
}

const message = { to: "cliente@example.com", subject: "Oi", html: "<p>Oi</p>" };

describe("sendEmail", () => {
  beforeEach(() => {
    sendMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock("resend");
  });

  it("sem RESEND_API_KEY não envia e avisa no console", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { sendEmail, isEmailConfigured } = await loadEmailModule({
      RESEND_API_KEY: "",
    });

    await sendEmail(message);

    expect(isEmailConfigured).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("RESEND_API_KEY"));
  });

  it("com a chave envia usando o remetente configurado", async () => {
    sendMock.mockResolvedValue({ data: { id: "1" }, error: null });
    const { sendEmail, isEmailConfigured } = await loadEmailModule({
      RESEND_API_KEY: "re_test",
      EMAIL_FROM: "AutoSystem <autosystem@nulldev.com.br>",
    });

    await sendEmail(message);

    expect(isEmailConfigured).toBe(true);
    expect(sendMock).toHaveBeenCalledWith({
      from: "AutoSystem <autosystem@nulldev.com.br>",
      ...message,
    });
  });

  it("usa o remetente padrão quando EMAIL_FROM não existe", async () => {
    sendMock.mockResolvedValue({ data: { id: "1" }, error: null });
    const { sendEmail } = await loadEmailModule({
      RESEND_API_KEY: "re_test",
      EMAIL_FROM: "",
    });

    await sendEmail(message);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ from: "AutoSystem <onboarding@resend.dev>" }),
    );
  });

  it("lança quando o Resend devolve erro", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "domínio não verificado" },
    });
    const { sendEmail } = await loadEmailModule({ RESEND_API_KEY: "re_test" });

    await expect(sendEmail(message)).rejects.toThrow(
      "Resend: validation_error - domínio não verificado",
    );
  });
});
