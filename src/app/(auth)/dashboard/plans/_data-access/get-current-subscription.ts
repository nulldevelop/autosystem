"use server";

import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { subscriptionPlans } from "@/utils/plans/subscription-plans";

export async function getCurrentSubscription() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    },
  });

  if (!user || !user.subscription) {
    return null;
  }

  const planInfo = subscriptionPlans.find(
    (p) => p.slug === user.subscription?.plan,
  );

  return {
    ...user.subscription,
    planDetails: planInfo,
  };
}
