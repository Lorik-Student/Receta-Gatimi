export interface RecipeReportRecord {
    id: number;
    recipe_id: number;
    recipe_title: string;
    recipe_image?: string | null;
    recipe_hidden: boolean;
    recipe_hidden_at?: Date | null;
    recipe_hidden_reason?: string | null;
    reporter_user_id: number;
    reporter_emri: string;
    reporter_mbiemri: string;
    reason: string;
    data: Date;
}

export interface UserReportRecord {
    id: number;
    reported_user_id: number;
    reported_emri: string;
    reported_mbiemri: string;
    reported_email: string;
    reporter_user_id: number;
    reporter_emri: string;
    reporter_mbiemri: string;
    reason: string;
    data: Date;
}

export interface BugReportRecord {
    id: number;
    reporter_user_id: number;
    reporter_emri: string;
    reporter_mbiemri: string;
    reporter_email: string;
    subject: string;
    message: string;
    status: "pending" | "resolved";
    data: Date;
}