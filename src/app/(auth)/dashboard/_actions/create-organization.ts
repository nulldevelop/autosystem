"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";

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

  cnpj: z.string().min(14, {
    message: "O CNPJ deve ter pelo menos 14 caracteres.",
  }),
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
        errors.name?.[0] ||
        errors.slug?.[0] ||
        errors.logo?.[0] ||
        "Dados inválidos";

      return {
        success: false,
        message: firstError,
      };
    }

    const { name, slug, logo, address, phone, cnpj } = validationResult.data;

    const headersList = await headers();

    // Criar organização usando Better Auth
    const data = await auth.api.createOrganization({
      body: {
        name,
        slug,
        address,
        phone,
        cnpj,
        logo: logo || undefined,
        keepCurrentActiveOrganization: true,
      },
      headers: headersList,
    });

    if (!data) {
      return {
        success: false,
        message: "Erro ao criar a oficina. Tente novamente.",
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      message: "Oficina criada com sucesso!",
      organizationId: data.id,
    };
  } catch (error: any) {
    console.error("Erro ao criar organização:", error);

    // Tratamento de erros específicos
    if (error?.message?.includes("slug")) {
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

export async function updateOrganizationLogo(
  organizationId: string,
  logoUrl: string,
) {
  try {
    const headersList = await headers();
    await auth.api.updateOrganization({
      body: {
        organizationId,
        logo: logoUrl,
      },
      headers: headersList,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar logo:", error);
    return { success: false };
  }
}
