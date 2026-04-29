import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import recipeRoutes from "./modules/recipe/recipe.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import shoppingRoutes from "./modules/shopping/shopping.routes.js";
import interactionRoutes from "./modules/interaction/interaction.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/recipes", recipeRoutes);
router.use("/categories", categoryRoutes);
router.use("/shopping-lists", shoppingRoutes);
router.use("/interactions", interactionRoutes);

// Temporary alias to avoid breaking existing clients.
router.use("/shopping", shoppingRoutes);

export default router;