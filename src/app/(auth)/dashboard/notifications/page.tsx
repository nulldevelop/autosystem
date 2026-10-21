import { redirect } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { getSession } from "@/lib/getSession";
import { prisma } from "@/lib/prisma";
import { NotificationsList } from "./_components/notifications-list";

async function getNotifications(orgId: string) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { organizationId: orgId },
      include: {
        customer: true,
        budget: { include: { vehicle: true } },
        serviceOrder: { include: { vehicle: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { organizationId: orgId, read: false },
    }),
  ]);

  return { notifications, unreadCount };
}

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth");
  }

  const orgId = session.session.activeOrganizationId;

  if (!orgId) {
    redirect("/dashboard");
  }

  const { notifications, unreadCount } = await getNotifications(orgId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        description={
          unreadCount > 0
            ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
            : "Você está em dia: nenhuma notificação pendente."
        }
      />

      <NotificationsList
        notifications={JSON.parse(JSON.stringify(notifications))}
        unreadCount={unreadCount}
      />
    </div>
  );
}
