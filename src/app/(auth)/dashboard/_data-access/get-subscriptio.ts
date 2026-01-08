import { prisma } from "@/lib/prisma";

export async function getSubscription(userID: string) {
  // É boa prática usar try/catch em operações de banco de dados
  try {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: userID,
      },
    });
    return subscription;
  } catch (error) {
    console.error("Erro ao buscar assinatura:", error);
    return null;
  }
}
