import type { Prisma } from "@/generated/prisma/client";

export type BudgetWithRelations = Prisma.BudgetGetPayload<{
  include: {
    customer: true;
    vehicle: true;
    organization: true;
    serviceOrder: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>;
