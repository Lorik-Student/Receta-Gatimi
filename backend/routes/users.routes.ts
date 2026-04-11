import { Router } from "express";
import * as Controller from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { userIdParamsSchema } from "../schemas/user.schema.js";
const router = Router();

router.get("/:id", validate({ params: userIdParamsSchema }), Controller.getUserProfile);
router.get("/", Controller.getAllUserProfiles);


export default router;