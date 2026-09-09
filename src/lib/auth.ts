import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
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
