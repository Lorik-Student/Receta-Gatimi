import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./users.routes.js";
import recipeRoutes from "./recipes.routes.js";
import categoriesRoutes from "./categories.routes.js";
import shoppingRoutes from "./shopping.routes.js";


const router = Router();

// Identity dhe Users
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

// Recipe 
router.use("/recipes", recipeRoutes);
router.use("/categories", categoriesRoutes);

// Shopping dhe Interactions
router.use("/shopping", shoppingRoutes);
// router.use("/interactions", interactionRoutes);

export default router;