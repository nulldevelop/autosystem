"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";

export async function getServiceOrderDetails(id: string) {
  const session = await getSession();

  if (!session?.user || !session.session.activeOrganizationId) {
    return null;
  }

  const serviceOrder = await prisma.serviceOrder.findFirst({
    where: {
      id,
      organizationId: session.session.activeOrganizationId,
    },
    include: {
      customer: true,
      vehicle: true,
      budget: {
        include: {
          photos: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
      transaction: true,
    },
  });

  return serviceOrder;
}

export type ServiceOrderDetails = NonNullable<
  Awaited<ReturnType<typeof getServiceOrderDetails>>
>;
