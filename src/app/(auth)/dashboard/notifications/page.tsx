import { Bell, CheckCheck } from "lucide-react";
import { redirect } from "next/navigation";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            Notificações
          </h1>
          <p className="text-white/40 mt-1">
            {unreadCount > 0
              ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
              : "Todas as notificações foram vistas"}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action="/api/notifications" method="POST">
            <input type="hidden" name="readAll" value="true" />
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como lidas
            </button>
          </form>
        )}
      </div>

      <NotificationsList
        notifications={JSON.parse(JSON.stringify(notifications))}
        unreadCount={unreadCount}
      />
    </div>
  );
}
