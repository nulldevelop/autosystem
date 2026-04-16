"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { revalidatePath } from "next/cache";
import { TransactionType, TransactionCategory, TransactionStatus } from "@/generated/prisma/client";

const createTransactionSchema = z.object({
  description: z.string().min(3, "Descrição é obrigatória"),
  amount: z.number().positive("Valor deve ser maior que zero"),
  type: z.nativeEnum(TransactionType),
  category: z.nativeEnum(TransactionCategory),
  status: z.nativeEnum(TransactionStatus),
  dueDate: z.date(),
  paymentMethod: z.string().optional(),
});

export async function createTransaction(input: z.infer<typeof createTransactionSchema>) {
  try {
    const session = await getSession();
    const orgId = session?.session.activeOrganizationId;

    if (!orgId) {
      return { success: false, message: "Organização não selecionada." };
    }

    const data = createTransactionSchema.parse(input);

    await prisma.transaction.create({
      data: {
        ...data,
        organizationId: orgId,
        // Para despesas e receitas manuais, o valor limpo (netAmount) é igual ao bruto (amount)
        // a menos que seja uma OS (onde descontamos o custo de peças).
        costAmount: 0,
        netAmount: data.type === "INCOME" ? data.amount : -data.amount,
        paymentDate: data.status === "PAID" ? new Date() : null,
      },
    });

    revalidatePath("/dashboard/financeiro");
    return { success: true, message: "Transação lançada com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    return { success: false, message: "Erro ao processar o lançamento financeiro." };
  }
}
