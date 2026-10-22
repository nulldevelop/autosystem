"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidCnpj } from "@/utils/validateCNPJ";

const createOrganizationSchema = z.object({
  name: z.string().min(2, {
    message: "O nome da oficina deve ter pelo menos 2 caracteres.",
  }),
  slug: z
    .string()
    .min(2, {
      message: "O slug deve ter pelo menos 2 caracteres.",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "O slug deve conter apenas letras minúsculas, números e hífens.",
    }),
  logo: z.string().url().optional().or(z.literal("")),
  address: z.string().min(2, {
    message: "O endereço deve ter pelo menos 2 caracteres.",
  }),
  phone: z.string().min(11, {
    message: "O telefone deve ter pelo menos 11 caracteres.",
  }),

  cnpj: z.string().refine(isValidCnpj, { message: "CNPJ inválido." }),
});

interface CreateOrganizationInput {
  name: string;
  slug: string;
  logo?: string;
  address: string;
  phone: string;
  cnpj: string;
}

interface CreateOrganizationResponse {
  success: boolean;
  message: string;
  organizationId?: string;
}

export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<CreateOrganizationResponse> {
  try {
    // Validação dos dados
    const validationResult = createOrganizationSchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError =
        Object.values(errors).flat()[0] || "Dados inválidos";

      return {
        success: false,
        message: firstError,
      };
    }

    const { name, slug, logo, address, phone, cnpj } = validationResult.data;

    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return {
        success: false,
        message: "Você precisa estar autenticado para criar uma oficina.",
      };
    }

    // Slug precisa ser único: se já existe, acrescenta um sufixo curto
    let uniqueSlug = slug;
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = await prisma.organization.findUnique({
        where: { slug: uniqueSlug },
        select: { id: true },
      });
      if (!taken) break;
      uniqueSlug = `${slug}-${crypto.randomUUID().slice(0, 4)}`;
    }

    // Organização, vínculo do dono e sessão ativa: tudo ou nada
    const org = await prisma.$transaction(async (tx) => {
      const created = await tx.organization.create({
        data: {
          id: crypto.randomUUID(),
          name,
          slug: uniqueSlug,
          address,
          phone,
          cnpj,
          logo: logo || null,
        },
      });

      await tx.member.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: created.id,
          userId: session.user.id,
          role: "owner",
          createdAt: new Date(),
        },
      });

      if (session.session?.id) {
        await tx.session.update({
          where: { id: session.session.id },
          data: { activeOrganizationId: created.id },
        });
      }

      return created;
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Oficina criada com sucesso!",
      organizationId: org.id,
    };
    // biome-ignore lint/suspicious/noExplicitAny: error is dynamic
  } catch (error: any) {
    console.error("Erro ao criar organização:", error);

    // Tratamento de erros específicos
    if (error?.code === "P2002") {
      return {
        success: false,
        message: "Este slug já está em uso. Escolha outro.",
      };
    }

    if (error?.message?.includes("limit")) {
      return {
        success: false,
        message: "Você atingiu o limite de oficinas permitidas.",
      };
    }

    if (error?.status === 401 || error?.statusCode === 401) {
      return {
        success: false,
        message: "Você precisa estar autenticado para criar uma oficina.",
      };
    }

    if (error?.status === 403 || error?.statusCode === 403) {
      return {
        success: false,
        message: "Você não tem permissão para criar uma oficina.",
      };
    }

    return {
      success: false,
      message: error?.message || "Ocorreu um erro ao criar a oficina.",
    };
  }
}

// Action auxiliar para verificar se um slug está disponível
export async function checkOrganizationSlug(
  slug: string,
): Promise<{ available: boolean; message?: string }> {
  try {
    const data = await auth.api.checkOrganizationSlug({
      body: {
        slug,
      },
    });

    return {
      available: data?.status === true,
      message: data?.status === false ? "Este slug já está em uso" : undefined,
    };
  } catch (error) {
    console.error("Erro ao verificar slug:", error);
    return {
      available: false,
      message: "Erro ao verificar disponibilidade do slug",
    };
  }
}

// Só dono/administrador da própria oficina pode alterar os dados dela.
// O organizationId vem do cliente, então nunca é confiado sem checar a membership.
async function canManageOrganization(organizationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return false;

  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
      role: { in: ["owner", "admin"] },
    },
    select: { id: true },
  });
  return Boolean(member);
}

export async function updateOrganizationLogo(
  organizationId: string,
  logoUrl: string,
) {
  try {
    if (!(await canManageOrganization(organizationId))) {
      return { success: false };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { logo: logoUrl },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar logo:", error);
    return { success: false };
  }
}

export async function updateOrganizationData(
  organizationId: string,
  data: {
    name: string;
    phone: string;
    cnpj: string;
    address: string;
  },
) {
  if (!isValidCnpj(data.cnpj)) {
    return { success: false, message: "CNPJ inválido." };
  }

  try {
    if (!(await canManageOrganization(organizationId))) {
      return {
        success: false,
        message: "Você não tem permissão para alterar esta oficina.",
      };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        phone: data.phone,
        cnpj: data.cnpj,
        address: data.address,
      },
    });

    revalidatePath("/dashboard/config");
    return { success: true, message: "Dados atualizados com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar organização:", error);
    return { success: false, message: "Erro ao atualizar dados." };
  }
}
