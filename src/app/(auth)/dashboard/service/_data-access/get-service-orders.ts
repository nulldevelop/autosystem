"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getServiceOrders() {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    throw new Error("Usuário não autenticado ou organização não selecionada.");
  }

  const serviceOrders = await prisma.serviceOrder.findMany({
    where: {
      organizationId: session.session.activeOrganizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: true,
      vehicle: true,
      budget: {
        include: {
          customer: true,
          vehicle: true,
          items: {
            include: {
              product: true,
            }
          },
          organization: true,
          serviceOrder: true
        }
      },
    },
  });

  return serviceOrders;
}
