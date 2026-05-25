import * as NotificationModel from "./notification.model.js";

export async function createRecipeActivityNotification(
    recipeId: number,
    actorUserId: number,
    notificationType: "favorite" | "review",
    reviewValue?: number
) {
    return NotificationModel.insertRecipeActivityNotification(recipeId, actorUserId, notificationType, reviewValue);
}

export async function getMyNotifications(userId: number, limit: number) {
    const [notifications, unreadCount] = await Promise.all([
        NotificationModel.getNotificationsByUser(userId, limit),
        NotificationModel.getUnreadNotificationCount(userId)
    ]);

    return { notifications, unreadCount };
}

export async function markMyNotificationsAsRead(userId: number) {
    const updated = await NotificationModel.markNotificationsAsRead(userId);
    const unreadCount = await NotificationModel.getUnreadNotificationCount(userId);

    return { updated, unreadCount };
}