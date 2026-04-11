import * as authController from "../controllers/auth.controller.js";
import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { loginBodySchema, signUpBodySchema } from "../schemas/auth.schema.js";

const router = Router();

router.post("/signup", validate({ body: signUpBodySchema }), authController.signup);
router.post("/login", validate({ body: loginBodySchema }), authController.login);

export default router;