"use server";

import { prisma } from "@/lib/prisma";

export async function getServiceOrderDetails(id: string) {
  const serviceOrder = await prisma.serviceOrder.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      vehicle: true,
      budget: {
        include: {
          photos: true
        }
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

export type ServiceOrderDetails = NonNullable<Awaited<ReturnType<typeof getServiceOrderDetails>>>;
