import { Router } from "express";
import * as Controller from "./user.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { userIdParamsSchema } from "./user.schema.js";
import { authMiddleware, userAuthMiddleware } from "../../common/middleware/auth.middleware.js";
const router = Router();

router.get("/me/profile", userAuthMiddleware, Controller.getUserProfile);
router.get("/all/profiles", Controller.getAllUserProfiles);


export default router;