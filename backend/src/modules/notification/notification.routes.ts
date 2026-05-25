import { Router } from "express";
import * as NotificationController from "./notification.controller.js";
import { userAuthMiddleware } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { notificationListQuerySchema } from "./notification.schema.js";

const router = Router();

router.get("/me", userAuthMiddleware, validate({ query: notificationListQuerySchema }), NotificationController.getMyNotifications);
router.patch("/me/read", userAuthMiddleware, NotificationController.markMyNotificationsAsRead);

export default router;