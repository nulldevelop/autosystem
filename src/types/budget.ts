import { Prisma } from "@/generated/prisma/client";

export type BudgetWithRelations = Prisma.BudgetGetPayload<{
  include: {
    customer: true;
    vehicle: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>;