import * as authController from "./auth.controller.js";
import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware.js";
import { loginBodySchema, signUpBodySchema } from "./auth.schema.js";

const router = Router();

router.post("/signup", validate({ body: signUpBodySchema }), authController.signup);
router.post("/login", validate({ body: loginBodySchema }), authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
