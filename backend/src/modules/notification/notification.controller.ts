import type { Request, Response } from "express";
import { BadRequestError } from "../../common/http-errors.js";
import type { RequestWithClaims } from "../../common/middleware/auth.middleware.js";
import * as NotificationService from "./notification.service.js";

function getAuthenticatedUserId(req: Request): number {
    const claims = (req as RequestWithClaims).claims;
    const rawUserId = claims?.sub ?? (claims as Record<string, unknown> | undefined)?.id;
    const userId = typeof rawUserId === "string" ? Number.parseInt(rawUserId, 10) : Number(rawUserId);

    if (!Number.isInteger(userId) || userId <= 0) {
        throw new BadRequestError("INVALID_USER", "Nuk mund të përcaktohet përdoruesi aktual");
    }

    return userId;
}

export async function getMyNotifications(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const limit = Number(req.query.limit ?? 10);
    const data = await NotificationService.getMyNotifications(userId, limit);
    res.json(data);
}

export async function markMyNotificationsAsRead(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const result = await NotificationService.markMyNotificationsAsRead(userId);
    res.json({ message: "Notifications marked as read", ...result });
}