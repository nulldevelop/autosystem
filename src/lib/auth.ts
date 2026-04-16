import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "@/lib/prisma"; 
import { getActiveOrganization } from "./getActiveOrganization";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  // ADICIONANDO SCHEMA DE SESSÃO PARA PERSISTIR O ORG ID
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
    schema: {
      fields: {
        activeOrganizationId: {
          type: "string",
          required: false,
        },
      },
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

  // HOOK PARA GARANTIR QUE A SESSÃO SEMPRE TENHA A ORG ATIVA
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

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "dummy_secret",
});
