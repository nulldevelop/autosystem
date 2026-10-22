import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "AutoSystem <onboarding@resend.dev>";

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

const resend = isEmailConfigured
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    // sem chave (ex.: dev local): não envia e-mails
    console.warn(`[email] RESEND_API_KEY ausente, e-mail não enviado: ${input.subject}`);
    return;
  }

  const { error } = await resend.emails.send({ from: FROM, ...input });
  if (error) {
    throw new Error(`Resend: ${error.name} - ${error.message}`);
  }
}
