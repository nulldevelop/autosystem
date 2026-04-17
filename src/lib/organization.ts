import { headers } from "next/headers";
import { getSession as getServerSession } from "@/lib/getSession";
import { auth } from "./auth";
import { prisma } from "./prisma";

export class OrganizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationError";
  }
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new OrganizationError("UNAUTHORIZED");
  }

  return session;
}

export async function getUserId(): Promise<string> {
  const session = await requireServerSession();
  return session.user.id;
}

export async function requireActiveOrganizationId(): Promise<string> {
  const session = await requireServerSession();
  const orgId = session.session.activeOrganizationId;

  if (!orgId) {
    throw new OrganizationError("ORGANIZATION_REQUIRED");
  }

  return orgId;
}

export async function getActiveOrganizationId(): Promise<string | null> {
  try {
    const session = await getServerSession();
    return session?.session?.activeOrganizationId ?? null;
  } catch {
    return null;
  }
}

export async function setActiveOrganization(organizationId: string) {
  const session = await getServerSession();
  if (!session) {
    throw new OrganizationError("UNAUTHORIZED");
  }

  await prisma.session.update({
    where: { id: session.session.id },
    data: { activeOrganizationId: organizationId },
  });
}

export async function getUserOrganizations() {
  const session = await requireServerSession();
  const userId = session.user.id;

  const memberships = await prisma.member.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    role: m.role,
  }));
}
