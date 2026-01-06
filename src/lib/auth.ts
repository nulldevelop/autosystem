import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { prisma } from "@/lib/prisma"; // Ajuste conforme seu projeto
import { getActiveOrganization } from "./getActiveOrganization";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // ou "mysql", "sqlite"
  }),

  // Configuração de Email e Password
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Plugin de Organização
  plugins: [
    organization({
      // Permite que usuários criem organizações
      allowUserToCreateOrganization: true,
      // Ou com lógica customizada:
      // allowUserToCreateOrganization: async (user) => {
      //   // Verifica se o usuário tem uma assinatura ativa, por exemplo
      //   const subscription = await getSubscription(user.id);
      //   return subscription?.plan === "pro";
      // },

      // Limite de organizações por usuário
      // organizationLimit: 5,
      // Ou com lógica customizada:
      // organizationLimit: async (user) => {
      //   const subscription = await getSubscription(user.id);
      //   return subscription?.plan === "pro" ? 10 : 1;
      // },

      // Papel do criador da organização
      creatorRole: "owner", // ou "admin"

      // Limite de membros por organização
      membershipLimit: 100,

      // Tempo de expiração do convite (em segundos)
      invitationExpiresIn: 60 * 60 * 48, // 48 horas

      // Cancelar convites pendentes ao reenviar
      cancelPendingInvitationsOnReInvite: true,

      // Função para enviar email de convite (OBRIGATÓRIA para convites funcionarem)
      sendInvitationEmail: async (data) => {
        // Implementar seu serviço de email aqui
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;

        console.log("Enviar email de convite:", {
          to: data.email,
          from: data.inviter.user.email,
          organizationName: data.organization.name,
          inviteLink,
        });

        // Exemplo com Resend ou outro serviço:
        // await sendEmail({
        //   to: data.email,
        //   subject: `Convite para ${data.organization.name}`,
        //   html: `
        //     <h1>Você foi convidado para ${data.organization.name}</h1>
        //     <p>Por: ${data.inviter.user.name} (${data.inviter.user.email})</p>
        //     <p>Papel: ${data.role}</p>
        //     <a href="${inviteLink}">Aceitar Convite</a>
        //   `,
        // });
      },

      // Hooks de organização (opcional)
      organizationHooks: {
        beforeCreateOrganization: async ({ organization, user }) => {
          console.log(
            `Usuário ${user.email} criando organização ${organization.name}`,
          );

          // Você pode modificar os dados antes de salvar
          return {
            data: {
              ...organization,
              // Adicionar metadata customizada
              metadata: {
                ...organization.metadata,
                createdBy: user.email,
                createdAt: new Date().toISOString(),
              },
            },
          };
        },

        // Depois de criar a organização
        afterCreateOrganization: async ({ organization }) => {
          console.log(`Organização ${organization.name} criada com sucesso`);

          // Criar recursos padrão, enviar notificações, etc.
          // await createDefaultResources(organization.id);
          // await sendWelcomeEmail(user.email, organization.name);
        },

        // Antes de adicionar um membro
        beforeAddMember: async ({ member, user, organization }) => {
          console.log(`Adicionando ${user.email} à ${organization.name}`);
          return {
            data: {
              ...member,
            },
          };
        },

        afterAddMember: async ({ user, organization }) => {
          console.log(`Membro ${user.email} adicionado à ${organization.name}`);
        },
      },
      schema: {
        organization: {
          additionalFields: {
            phone: {
              type: "string",
              required: false,
              input: true,
            },
            address: {
              type: "string",
              required: false,
              input: true,
            },
            cnpj: {
              type: "string",
              required: false,
              input: true,
            },
          },
        },
      },
    }),
  ],

  // Configuração de sessão
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId);
          if (organization) {
            return {
              data: {
                ...session,
                activeOrganizationId: organization.id,
              },
            };
          }
          return { data: session };
        },
      },
    },
  },

  // URL base da aplicação
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Secret para assinar tokens
  secret: process.env.BETTER_AUTH_SECRET as string,
});
