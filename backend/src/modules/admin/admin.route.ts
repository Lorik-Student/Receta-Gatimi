import { Router } from "express";
import * as AdminController from "./admin.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { UserInsertParamsSchema, UserUpdateParamsSchema, userIdParamsSchema } from "../user/user.schema.js";

const router = Router();

router.get("/users", AdminController.getUsers);
router.post("/users", validate({ body: UserInsertParamsSchema }), AdminController.createUser);
router.patch("/users/:id", validate({ params: userIdParamsSchema, body: UserUpdateParamsSchema }), AdminController.updateUser);
router.delete("/users/:id", validate({ params: userIdParamsSchema }), AdminController.deleteUser);

export default router;