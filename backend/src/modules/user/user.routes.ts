import { Router } from "express";
import * as Controller from "./user.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { userIdParamsSchema } from "./user.schema.js";
import { authMiddleware } from "../../common/middleware/auth.middleware.js";
const router = Router();

router.get("/:id", validate({ params: userIdParamsSchema }), Controller.getUserProfile);
router.get("/", Controller.getAllUserProfiles);


export default router;