import { Router } from "express";
import adminRoutes from "./modules/admin/admin.route.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import recipeRoutes from "./modules/recipe/recipe.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import shoppingRoutes from "./modules/shopping/shopping.routes.js";
import { adminAuthMiddleware, authMiddleware, userAuthMiddleware } from "./common/middleware/auth.middleware.js";

const router = Router();

router.use("/admin", adminAuthMiddleware, adminRoutes);
router.use("/auth", authRoutes);
router.use("/users", userAuthMiddleware, userRoutes);
router.use("/recipes", recipeRoutes);
router.use("/categories", categoryRoutes);
router.use("/shopping-lists", shoppingRoutes);

// Temporary alias to avoid breaking existing clients.
router.use("/shopping", shoppingRoutes);

export default router;