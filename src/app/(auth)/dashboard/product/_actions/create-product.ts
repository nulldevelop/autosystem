"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const createProductSchema = z.object({
  name: z.string().min(1, "O nome do produto é obrigatório."),
  price: z.number().nonnegative("O preço deve ser um número positivo."),
  costPrice: z.number().nonnegative("O preço de custo deve ser um número positivo."),
  sku: z.string().min(1, "O SKU é obrigatório."),
  category: z.string().optional(),
  unit: z.string().default("UN"),
  stockQuantity: z.number().int().default(0),
  minStock: z.number().int().default(0),
});

interface CreateProductInput {
  name: string;
  price: number;
  costPrice: number;
  sku: string;
  category?: string;
  unit?: string;
  stockQuantity?: number;
  minStock?: number;
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
      return {
        success: false,
        message: "Dados inválidos. Verifique os campos.",
      };
    }

    const data = validationResult.data;

    const product = await prisma.product.create({
      data: {
        ...data,
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
