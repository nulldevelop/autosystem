"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "O nome do produto é obrigatório."),
  price: z.number().nonnegative("O preço deve ser um número positivo."),
  costPrice: z.number().nonnegative("O preço de custo deve ser um número positivo."),
  sku: z.string().min(1, "O SKU é obrigatório."),
  category: z.string().optional(),
  unit: z.string().default("UN"),
  minStock: z.number().int().default(0),
});

export async function updateProduct(input: z.infer<typeof updateProductSchema>) {
  try {
    const session = await getSession();
    if (!session?.user || !session.session.activeOrganizationId) {
      return { success: false, message: "Não autorizado" };
    }

    const { id, ...data } = updateProductSchema.parse(input);

    await prisma.product.update({
      where: { 
        id,
        organizationId: session.session.activeOrganizationId 
      },
      data,
    });

    revalidatePath("/dashboard/product");
    return { success: true, message: "Produto atualizado com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao atualizar produto" };
  }
}
