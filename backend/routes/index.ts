import authRoutes from "./auth.routes.js";
import userRoutes from "./users.routes.js";
import { Router } from "express";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
// router.use("/recipes", recipeRoute);


export default router;