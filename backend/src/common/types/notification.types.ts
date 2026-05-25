export type NotificationType = "favorite" | "review";

export interface Notification {
    id: number;
    user_id: number;
    actor_user_id: number;
    recipe_id: number;
    notification_type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    data: Date;
    read_at?: Date | null;
}