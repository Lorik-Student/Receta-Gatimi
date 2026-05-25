import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Notification, NotificationType } from "../../common/types/notification.types.js";

type RecipeOwnerRow = RowDataPacket & {
    user_id: number | null;
    titulli: string | null;
};

type UserNameRow = RowDataPacket & {
    emri: string | null;
    mbiemri: string | null;
};

function buildDisplayName(row?: UserNameRow): string {
    if (!row) {
        return "Përdorues";
    }

    const displayName = [row.emri, row.mbiemri].filter(Boolean).join(" ").trim();
    return displayName || "Përdorues";
}

function buildNotificationTitle(notificationType: NotificationType): string {
    return notificationType === "review" ? "Vlerësim i ri" : "Shtim në të preferuarat";
}

function buildNotificationMessage(notificationType: NotificationType, actorName: string, recipeTitle: string, reviewValue?: number): string {
    if (notificationType === "review") {
        return `${actorName} vlerësoi "${recipeTitle}" me ${reviewValue ?? 0}/5.`;
    }

    return `${actorName} e shtoi "${recipeTitle}" te të preferuarat.`;
}

export async function insertRecipeActivityNotification(
    recipeId: number,
    actorUserId: number,
    notificationType: NotificationType,
    reviewValue?: number
): Promise<number | null> {
    const [recipeRows, actorRows] = await Promise.all([
        db.query<RowDataPacket[]>(
            `SELECT r.user_id, r.titulli
             FROM Recipes r
             WHERE r.id = ?
             LIMIT 1`,
            [recipeId]
        ),
        db.query<RowDataPacket[]>(
            "SELECT emri, mbiemri FROM users WHERE id = ? LIMIT 1",
            [actorUserId]
        )
    ]);

    const recipe = recipeRows[0][0] as RecipeOwnerRow | undefined;
    if (!recipe || !recipe.user_id) {
        return null;
    }

    const actor = actorRows[0][0] as UserNameRow | undefined;
    const actorName = buildDisplayName(actor);
    const recipeTitle = recipe.titulli?.trim() || "recetën tuaj";
    const title = buildNotificationTitle(notificationType);
    const message = buildNotificationMessage(notificationType, actorName, recipeTitle, reviewValue);

    const [res] = await db.query<ResultSetHeader>(
        `INSERT INTO Notifications (user_id, actor_user_id, recipe_id, notification_type, title, message, is_read)
         VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
        [recipe.user_id, actorUserId, recipeId, notificationType, title, message]
    );

    return res.insertId;
}

export async function getNotificationsByUser(userId: number, limit: number): Promise<Notification[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT id, user_id, actor_user_id, recipe_id, notification_type, title, message, is_read, data, read_at
         FROM Notifications
         WHERE user_id = ?
         ORDER BY data DESC, id DESC
         LIMIT ?`,
        [userId, limit]
    );

    return rows as Notification[];
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS unread_count FROM Notifications WHERE user_id = ? AND is_read = FALSE",
        [userId]
    );

    return Number(rows[0]?.unread_count ?? 0);
}

export async function markNotificationsAsRead(userId: number): Promise<number> {
    const [res] = await db.query<ResultSetHeader>(
        `UPDATE Notifications
         SET is_read = TRUE,
             read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
         WHERE user_id = ? AND is_read = FALSE`,
        [userId]
    );

    return res.affectedRows;
}