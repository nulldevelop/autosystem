import { describe, expect, it } from "vitest";
import {
  purchaseThanksTemplate,
  resetPasswordTemplate,
  verifyEmailTemplate,
} from "@/lib/email/templates";

const URL = "https://autosystem.nulldev.com.br/api/auth/verify?token=abc";

describe("verifyEmailTemplate", () => {
  it("cumprimenta pelo primeiro nome e inclui o link", () => {
    const { subject, html } = verifyEmailTemplate({ name: "Maria Silva" }, URL);
    expect(subject).toBe("Confirme seu e-mail no AutoSystem");
    expect(html).toContain("Bem-vindo, Maria!");
    expect(html).not.toContain("Silva");
    expect(html).toContain(`href="${URL}"`);
    expect(html).toContain("Confirmar e-mail");
  });

  it("funciona sem nome", () => {
    const { html } = verifyEmailTemplate({ name: null }, URL);
    expect(html).toContain("Bem-vindo ao AutoSystem!");
  });

  it("escapa HTML no nome", () => {
    const { html } = verifyEmailTemplate(
      { name: '<script>alert("x")</script>' },
      URL,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("limita o tamanho do nome", () => {
    const { html } = verifyEmailTemplate({ name: "A".repeat(200) }, URL);
    expect(html).not.toContain("A".repeat(41));
  });
});

describe("resetPasswordTemplate", () => {
  it("traz assunto, aviso de segurança e o link", () => {
    const { subject, html } = resetPasswordTemplate({ name: "João" }, URL);
    expect(subject).toBe("Redefinir sua senha no AutoSystem");
    expect(html).toContain("Olá, João");
    expect(html).toContain("Criar nova senha");
    expect(html).toContain("sua senha continua a mesma");
    expect(html).toContain(URL);
  });

  it("usa título genérico sem nome", () => {
    expect(resetPasswordTemplate({}, URL).html).toContain("Redefinir senha");
  });
});

describe("purchaseThanksTemplate", () => {
  const dashboardUrl = "https://autosystem.nulldev.com.br/dashboard";

  it("agradece e informa plano mensal", () => {
    const { subject, html } = purchaseThanksTemplate(
      { name: "Ana Souza" },
      { planName: "Plus", interval: "monthly", dashboardUrl },
    );
    expect(subject).toBe("Obrigado! Seu plano Plus está ativo");
    expect(html).toContain("Obrigado pela compra, Ana!");
    expect(html).toContain("<strong>Plus</strong> (mensal)");
    expect(html).toContain(dashboardUrl);
  });

  it("informa plano anual", () => {
    const { html } = purchaseThanksTemplate(
      { name: "Ana" },
      { planName: "Professional", interval: "yearly", dashboardUrl },
    );
    expect(html).toContain("(anual)");
  });

  it("funciona sem nome", () => {
    const { html } = purchaseThanksTemplate(
      { name: undefined },
      { planName: "Basic", interval: "monthly", dashboardUrl },
    );
    expect(html).toContain("Obrigado pela compra!");
  });
});
