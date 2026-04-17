import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user || !session?.session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.member.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      take: 1,
    });

    if (memberships.length > 0 && !session.session.activeOrganizationId) {
      await prisma.session.update({
        where: { id: session.session.id },
        data: { activeOrganizationId: memberships[0].organizationId },
      });
    }

    return NextResponse.json({
      success: true,
      activeOrganizationId:
        session.session.activeOrganizationId || memberships[0]?.organizationId,
    });
  } catch (error) {
    console.error("Error syncing organization:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
