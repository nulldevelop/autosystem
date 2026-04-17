"use client";

import {
  Bell,
  CheckCheck,
  CheckCircle,
  FileSignature,
  FileText,
  UserPlus,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type NotificationType =
  | "BUDGET_SIGNED"
  | "SERVICE_ORDER_SIGNED"
  | "BUDGET_APPROVED"
  | "SERVICE_ORDER_COMPLETED"
  | "NEW_CUSTOMER"
  | "NEW_BUDGET";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  customer?: { name: string } | null;
  budget?: {
    id: string;
    vehicle: { marca: string; model: string; licensePlate: string };
  } | null;
  serviceOrder?: {
    id: string;
    vehicle: { marca: string; model: string; licensePlate: string };
  } | null;
}

const typeConfig = {
  BUDGET_SIGNED: {
    icon: FileSignature,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
  },
  SERVICE_ORDER_SIGNED: {
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
  },
  BUDGET_APPROVED: {
    icon: FileText,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
  },
  SERVICE_ORDER_COMPLETED: {
    icon: Wrench,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
  },
  NEW_CUSTOMER: {
    icon: UserPlus,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
  },
  NEW_BUDGET: {
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("pt-BR");
}

export function NotificationsList({
  notifications,
  unreadCount: initialUnreadCount,
}: {
  notifications: Notification[];
  unreadCount: number;
}) {
  const [notificationsList, setNotificationsList] = useState(notifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      setNotificationsList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });

      setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  if (notificationsList.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Bell className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Nenhuma notificação
        </h3>
        <p className="text-white/40">
          Quando houver alguma atividade, você será notificado aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm font-medium w-full justify-center"
        >
          <CheckCheck className="w-4 h-4" />
          Marcar todas como lidas ({unreadCount})
        </button>
      )}

      {notificationsList.map((notification) => {
        const config = typeConfig[notification.type];
        const Icon = config.icon;

        return (
          <button
            key={notification.id}
            onClick={() => !notification.read && markAsRead(notification.id)}
            className={cn(
              "w-full text-left p-5 rounded-2xl border transition-all",
              notification.read
                ? "bg-white/[0.02] border-white/10"
                : "bg-primary/5 border-primary/20 hover:bg-primary/10",
            )}
          >
            <div className="flex gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  config.bgColor,
                )}
              >
                <Icon className={cn("w-6 h-6", config.color)} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-white/60 mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-white/40 shrink-0">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>

                {(notification.budget || notification.serviceOrder) && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                    {notification.budget?.vehicle && (
                      <>
                        <span className="px-2 py-1 rounded bg-white/5">
                          {notification.budget.vehicle.marca}{" "}
                          {notification.budget.vehicle.model}
                        </span>
                        <span className="font-mono">
                          {notification.budget.vehicle.licensePlate}
                        </span>
                      </>
                    )}
                    {notification.serviceOrder?.vehicle && (
                      <>
                        <span className="px-2 py-1 rounded bg-white/5">
                          {notification.serviceOrder.vehicle.marca}{" "}
                          {notification.serviceOrder.vehicle.model}
                        </span>
                        <span className="font-mono">
                          {notification.serviceOrder.vehicle.licensePlate}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {notification.customer && (
                  <div className="mt-2 text-xs text-white/40">
                    Cliente: {notification.customer.name}
                  </div>
                )}
              </div>

              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
