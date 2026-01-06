"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const createCustomerSchema = z.object({
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
});

interface CreateCustomerInput {
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: "CPF" | "CNPJ";
}

interface CreateCustomerResponse {
  success: boolean;
  message: string;
  customerId?: string;
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<CreateCustomerResponse> {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      return {
        success: false,
        message: "Você precisa estar autenticado e ter uma organização ativa.",
      };
    }

    const validationResult = createCustomerSchema.safeParse(input);

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

    const { name, email, phone, document, documentType } =
      validationResult.data;

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        document,
        organizationId: session.session.activeOrganizationId,
      },
    });

    if (existingCustomer) {
      return {
        success: false,
        message: "Já existe um cliente com este CPF/CNPJ nesta organização.",
      };
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        document,
        documentType,
        organizationId: session.session.activeOrganizationId,
      },
    });

    revalidatePath("/dashboard/customer");
    return {
      success: true,
      message: "Cliente criado com sucesso!",
      customerId: customer.id,
    };
  } catch (error: any) {
    console.error("Erro ao criar cliente:", error);

    return {
      success: false,
      message: error?.message || "Ocorreu um erro ao criar o cliente.",
    };
  }
}
