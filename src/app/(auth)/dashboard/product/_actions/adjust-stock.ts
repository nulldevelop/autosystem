"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int(),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  reason: z.string().optional(),
});

export async function adjustStock(input: z.infer<typeof adjustStockSchema>) {
  try {
    const session = await getSession();
    if (!session?.user || !session.session.activeOrganizationId) {
      return { success: false, message: "Não autorizado" };
    }

    const { productId, quantity, type, reason } = adjustStockSchema.parse(input);

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId, organizationId: session.session.activeOrganizationId }
      });

      if (!product) throw new Error("Produto não encontrado");

      const newQuantity = type === "IN" 
        ? product.stockQuantity + Math.abs(quantity)
        : type === "OUT" 
          ? product.stockQuantity - Math.abs(quantity)
          : quantity;

      if (newQuantity < 0) throw new Error("Estoque insuficiente");

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newQuantity }
      });

      await tx.productMovement.create({
        data: {
          productId,
          type,
          quantity: type === "ADJUSTMENT" ? quantity : Math.abs(quantity),
          reason
        }
      });
    });

    revalidatePath("/dashboard/product");
    return { success: true, message: "Estoque ajustado com sucesso!" };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message || "Erro ao ajustar estoque" };
  }
}
