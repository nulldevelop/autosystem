"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { canPermission } from "@/utils/permissions/canPermission";

const createBudgetSchema = z.object({
  customerId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  observacoes: z.string().optional(),
  profitMargin: z.number().min(0),
  kilometers: z.number().optional().default(0),
  fuelLevel: z.string().optional().default("50"),
  checklist: z.any().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string().optional(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
      }),
    )
    .min(1),
});

// biome-ignore lint/suspicious/noExplicitAny: generic input payload
export async function createBudget(input: any) {
  try {
    const session = await getSession();

    if (!session?.user || !session.session.activeOrganizationId) {
      return { success: false, message: "Não autenticado." };
    }

    const validation = createBudgetSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, message: "Dados inválidos." };
    }

    const permission = await canPermission({ type: "budget" });
    if (!permission.hasPermission) {
      return { success: false, message: "Limite do plano atingido." };
    }

    const {
      customerId,
      vehicleId,
      profitMargin,
      items,
      kilometers,
      fuelLevel,
      checklist,
      observacoes: rawObs,
    } = validation.data;

    const subtotal = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );
    const laborValue = subtotal * (profitMargin / 100);
    const finalAmount = subtotal + laborValue;

    const customItemsText = items
      .filter((item) => item.productId.startsWith("custom-"))
      .map(
        (item) => `${item.productName} (${item.quantity}x ${item.unitPrice})`,
      )
      .join(", ");

    const observacoes = customItemsText
      ? rawObs
        ? `${rawObs}\n\nCustom: ${customItemsText}`
        : `Custom: ${customItemsText}`
      : rawObs;

    const budget = await prisma.$transaction(async (tx) => {
      // 1. Criar o Orçamento
      const newBudget = await tx.budget.create({
        data: {
          customerId,
          vehicleId,
          itemsAmount: subtotal,
          laborValue: laborValue,
          totalAmount: finalAmount,
          observacoes,
          kilometers,
          fuelLevel,
          checklist: checklist ? JSON.parse(JSON.stringify(checklist)) : {},
          organizationId: session.session.activeOrganizationId,
        },
      });

      for (const item of items) {
        let pId = item.productId;
        const isCustom = pId.startsWith("custom-");

        if (isCustom) {
          // Itens customizados criam um produto genérico
          const cp = await tx.product.create({
            data: {
              name: item.productName || "Serviço/Peça",
              sku: `CUST-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              price: item.unitPrice,
              stockQuantity: 0,
              organizationId: session.session.activeOrganizationId,
            },
          });
          pId = cp.id;
        }

        // Apenas registrar o item no orçamento, sem mexer no estoque ainda
        await tx.budgetItem.create({
          data: {
            budgetId: newBudget.id,
            productId: pId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });
      }

      return newBudget;
    });

    revalidatePath("/dashboard/budget");
    revalidatePath("/dashboard/product"); // Atualizar lista de produtos
    return {
      success: true,
      message: "Orçamento criado e estoque atualizado!",
      budgetId: budget.id,
    };
    // biome-ignore lint/suspicious/noExplicitAny: error is dynamic
  } catch (error: any) {
    console.error("Erro ao criar orçamento e baixar estoque:", error);
    return {
      success: false,
      message: error.message || "Erro interno no servidor.",
    };
  }
}
