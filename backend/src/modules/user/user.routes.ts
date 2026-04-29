import { Router } from "express";
import * as Controller from "./user.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { userIdParamsSchema, UserInsertParamsSchema, UserUpdateParamsSchema } from "./user.schema.js";
import { adminAuthMiddleware, userAuthMiddleware } from "../../common/middleware/auth.middleware.js";
const router = Router();

router.get("/", adminAuthMiddleware, Controller.getUsers);
router.post("/", adminAuthMiddleware, validate({ body: UserInsertParamsSchema }), Controller.createUser);
router.patch("/:id", adminAuthMiddleware, validate({ params: userIdParamsSchema, body: UserUpdateParamsSchema }), Controller.updateUser);
router.delete("/:id", adminAuthMiddleware, validate({ params: userIdParamsSchema }), Controller.deleteUser);

router.get("/me/profile", userAuthMiddleware, Controller.getUserProfile);
router.get("/all/profiles", Controller.getAllUserProfiles);
router.get("/:id/profile", validate({ params: userIdParamsSchema }), Controller.getUserProfile);


export default router;