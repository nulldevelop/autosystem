import { prisma } from "./prisma";

export async function getActiveOrganization(userId: string) {
  // Find all memberships for the given user
  const memberships = await prisma.member.findMany({
    where: { userId },
    include: {
      organization: true, // Include organization details
    },
    orderBy: {
      createdAt: "asc", // Order by creation date, oldest first
    },
  });

  // If the user is a member of at least one organization, return the first one
  if (memberships.length > 0) {
    return memberships[0].organization;
  }

  // If the user is not a member of any organization, return null
  return null;
}
