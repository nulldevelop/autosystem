"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const updateCustomerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, {
    message: "O nome do cliente deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  phone: z.string().min(11, {
    message: "O telefone deve ter pelo menos 11 caracteres.",
  }),
  document: z.string().min(11, {
    message: "O CPF/CNPJ deve ter pelo menos 11 caracteres.",
  }),
  documentType: z.enum(["CPF", "CNPJ"]),
  address: z.string().optional(),
});

interface UpdateCustomerInput {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: "CPF" | "CNPJ";
  address?: string;
}

interface UpdateCustomerResponse {
  success: boolean;
  message: string;
}

export async function updateCustomer(
  input: UpdateCustomerInput,
): Promise<UpdateCustomerResponse> {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      return {
        success: false,
        message: "Você precisa estar autenticado e ter uma organização ativa.",
      };
    }

    const validationResult = updateCustomerSchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError =
        errors.name?.[0] ||
        errors.email?.[0] ||
        errors.phone?.[0] ||
        errors.document?.[0] ||
        "Dados inválidos";

      return {
        success: false,
        message: firstError,
      };
    }

    const { id, name, email, phone, document, documentType, address } =
      validationResult.data;

    // Verificar se o cliente pertence à organização
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        organizationId: session.session.activeOrganizationId,
      },
    });

    if (!customer) {
      return {
        success: false,
        message: "Cliente não encontrado ou você não tem permissão para editá-lo.",
      };
    }

    // Verificar se o documento já existe em outro cliente
    const existingWithDoc = await prisma.customer.findFirst({
      where: {
        document,
        organizationId: session.session.activeOrganizationId,
        id: { not: id },
      },
    });

    if (existingWithDoc) {
      return {
        success: false,
        message: "Já existe outro cliente com este CPF/CNPJ nesta organização.",
      };
    }

    await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        document,
        documentType,
        address,
      },
    });

    revalidatePath("/dashboard/customer");
    return {
      success: true,
      message: "Cliente atualizado com sucesso!",
    };
  } catch (error: unknown) {
    console.error("Erro ao atualizar cliente:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ocorreu um erro ao atualizar o cliente.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}
