import { Router } from "express";
import * as RecipeController from "./recipe.controller.js";
import { chefAuthMiddleware, userAuthMiddleware } from "../../common/middleware/auth.middleware.js";
const router = Router();

// Dashboard
router.get("/dashboard", RecipeController.getDashboard);

// Recipe Management
router.get("/", RecipeController.getRecipes);
router.get("/:id", RecipeController.getRecipe);
router.post("/", chefAuthMiddleware, RecipeController.createFullRecipe);
router.delete("/:id", chefAuthMiddleware, RecipeController.deleteRecipe);


export default router;