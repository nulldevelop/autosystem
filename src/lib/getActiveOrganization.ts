import { prisma } from "./prisma";

export async function getActiveOrganization(userId: string | undefined) {
  if (!userId) return null;

  const memberships = await prisma.member.findMany({
    where: { userId },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (memberships.length > 0) {
    return memberships[0].organization;
  }

  return null;
}
