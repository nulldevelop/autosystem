"use server";

import { revalidatePath } from "next/cache";
import { requireTenant, TenantError } from "@/lib/tenant";

// Ações expostas ao cliente: a oficina vem SEMPRE da sessão, nunca de um parâmetro.
// (A criação de notificações é feita só no servidor, nas rotas de assinatura.)

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { db } = await requireTenant();

    await db.notification.updateMany({
      where: { id: notificationId },
      data: { read: true },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    if (error instanceof TenantError) {
      return { success: false, error: error.message };
    }
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Falha ao atualizar a notificação" };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const { db } = await requireTenant();

    await db.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    if (error instanceof TenantError) {
      return { success: false, error: error.message };
    }
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: "Falha ao atualizar as notificações" };
  }
}
