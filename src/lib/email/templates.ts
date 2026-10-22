const BRAND = "#10b981";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function layout(opts: {
  preview: string;
  title: string;
  body: string;
  cta?: { label: string; url: string };
  footer?: string;
}) {
  const cta = opts.cta
    ? `<p style="margin:28px 0"><a href="${opts.cta.url}" style="background:${BRAND};color:#052e16;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:8px;display:inline-block">${escapeHtml(opts.cta.label)}</a></p>
       <p style="font-size:13px;color:#71717a;word-break:break-all">Se o botão não funcionar, copie este link:<br>${opts.cta.url}</p>`
    : "";

  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#18181b">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(opts.preview)}</span>
<div style="max-width:520px;margin:0 auto;padding:32px 16px">
  <p style="font-size:20px;font-weight:700;margin:0 0 16px">Auto<span style="color:${BRAND}">System</span></p>
  <div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e4e4e7">
    <h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(opts.title)}</h1>
    <div style="font-size:15px;line-height:1.6;color:#3f3f46">${opts.body}</div>
    ${cta}
  </div>
  <p style="font-size:12px;color:#a1a1aa;margin:16px 0 0">${opts.footer ?? "Você recebeu este e-mail porque há uma conta no AutoSystem com este endereço."}</p>
</div></body></html>`;
}

// sem escapar aqui: o layout já escapa o título uma vez
const firstName = (name?: string | null) =>
  (name?.trim().split(/\s+/)[0] || "").slice(0, 40);

export function verifyEmailTemplate(user: { name?: string | null }, url: string) {
  const name = firstName(user.name);
  return {
    subject: "Confirme seu e-mail no AutoSystem",
    html: layout({
      preview: "Confirme seu e-mail para ativar sua conta.",
      title: name ? `Bem-vindo, ${name}!` : "Bem-vindo ao AutoSystem!",
      body: "<p>Falta só um passo: confirme seu e-mail para ativar a conta e começar seu teste grátis.</p><p>O link vale por 1 hora.</p>",
      cta: { label: "Confirmar e-mail", url },
      footer: "Se você não criou uma conta, ignore este e-mail.",
    }),
  };
}

export function resetPasswordTemplate(user: { name?: string | null }, url: string) {
  const name = firstName(user.name);
  return {
    subject: "Redefinir sua senha no AutoSystem",
    html: layout({
      preview: "Use o link para criar uma nova senha.",
      title: name ? `Olá, ${name}` : "Redefinir senha",
      body: "<p>Recebemos um pedido para redefinir a senha da sua conta. O link vale por 1 hora.</p>",
      cta: { label: "Criar nova senha", url },
      footer:
        "Se você não pediu isso, ignore este e-mail: sua senha continua a mesma.",
    }),
  };
}

export function purchaseThanksTemplate(
  user: { name?: string | null },
  details: { planName: string; interval: "monthly" | "yearly"; dashboardUrl: string },
) {
  const name = firstName(user.name);
  const interval = details.interval === "yearly" ? "anual" : "mensal";
  return {
    subject: `Obrigado! Seu plano ${details.planName} está ativo`,
    html: layout({
      preview: `Seu plano ${details.planName} já está liberado.`,
      title: name ? `Obrigado pela compra, ${name}!` : "Obrigado pela compra!",
      body: `<p>Seu plano <strong>${escapeHtml(details.planName)}</strong> (${interval}) está ativo e todos os recursos já estão liberados.</p>
<p>Qualquer dúvida, é só responder este e-mail.</p>`,
      cta: { label: "Acessar o AutoSystem", url: details.dashboardUrl },
    }),
  };
}
