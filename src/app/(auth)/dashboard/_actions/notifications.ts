"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type NotificationType =
  | "BUDGET_SIGNED"
  | "SERVICE_ORDER_SIGNED"
  | "BUDGET_APPROVED"
  | "SERVICE_ORDER_COMPLETED"
  | "NEW_CUSTOMER"
  | "NEW_BUDGET";

type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  organizationId: string;
  budgetId?: string;
  serviceOrderId?: string;
  customerId?: string;
};

export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: input.type,
        title: input.title,
        message: input.message,
        organizationId: input.organizationId,
        budgetId: input.budgetId,
        serviceOrderId: input.serviceOrderId,
        customerId: input.customerId,
      },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error };
  }
}

export async function markAllNotificationsAsRead(organizationId: string) {
  try {
    await prisma.notification.updateMany({
      where: { organizationId, read: false },
      data: { read: true },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error };
  }
}
