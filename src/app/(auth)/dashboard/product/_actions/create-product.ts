"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const createProductSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório."),
  price: z.number().positive("O preço deve ser um número positivo."),
  sku: z.string().min(1, "O SKU é obrigatório."),
});

interface CreateProductInput {
  name: string;
  price: number;
  sku: string;
}

interface CreateProductResponse {
  success: boolean;
  message: string;
  productId?: string;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<CreateProductResponse> {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      return {
        success: false,
        message: "Você precisa estar autenticado e ter uma organização ativa.",
      };
    }

    const validationResult = createProductSchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      const firstError =
        errors.name?.[0] ||
        errors.price?.[0] ||
        errors.sku?.[0] ||
        "Dados inválidos";

      return {
        success: false,
        message: firstError,
      };
    }

    const { name, price, sku } = validationResult.data;

    const product = await prisma.product.create({
      data: {
        name,
        price,
        sku,
        organizationId: session.session.activeOrganizationId,
      },
    });

    revalidatePath("/dashboard/product");
    return {
      success: true,
      message: "Produto criado com sucesso!",
      productId: product.id,
    };
  } catch (error: unknown) {
    console.error("Erro ao criar produto:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Ocorreu um erro ao criar o produto.";

    return {
      success: false,
      message: errorMessage,
    };
  }
}
