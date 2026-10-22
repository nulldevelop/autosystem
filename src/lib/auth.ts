import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import {
  resetPasswordTemplate,
  verifyEmailTemplate,
} from "@/lib/email/templates";
import { prisma } from "@/lib/prisma";
import { getActiveOrganization } from "./getActiveOrganization";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://autosystem.nulldev.com.br",
  ],

  emailAndPassword: {
    enabled: true,
    // só exige confirmação quando há como enviar o e-mail (senão ninguém conseguiria entrar)
    requireEmailVerification: isEmailConfigured,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      const { subject, html } = resetPasswordTemplate(user, url);
      // sem await: evita revelar por tempo de resposta se o e-mail existe
      void sendEmail({ to: user.email, subject, html }).catch((error) =>
        console.error("Erro ao enviar e-mail de redefinição:", error),
      );
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      const { subject, html } = verifyEmailTemplate(user, url);
      void sendEmail({ to: user.email, subject, html }).catch((error) =>
        console.error("Erro ao enviar e-mail de confirmação:", error),
      );
    },
  },

  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      creatorRole: "owner",
      membershipLimit: 100,
      schema: {
        organization: {
          additionalFields: {
            phone: { type: "string", required: false, input: true },
            address: { type: "string", required: false, input: true },
            cnpj: { type: "string", required: false, input: true },
          },
        },
      },
    }),
  ],

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const org = await getActiveOrganization(session.userId);
          if (org) {
            return {
              data: {
                ...session,
                activeOrganizationId: org.id,
              },
            };
          }
          return { data: session };
        },
      },
    },
  },
});
