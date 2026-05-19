import { Router } from "express";
import * as RecipeController from "./recipe.controller.js";
import { chefAuthMiddleware } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { recipeIdParamsSchema, updateRecipeBodySchema } from "./recipe.schema.js";
import { createRecipeBodySchema } from "./recipe.schema.js";
const router = Router();

// Dashboard
router.get("/dashboard", RecipeController.getDashboard);

// Recipe Management
router.get("/", RecipeController.getRecipes);
router.get("/tags", RecipeController.getTags);
router.get("/:id", RecipeController.getRecipe);
router.post("/", chefAuthMiddleware, validate({ body: createRecipeBodySchema }), RecipeController.createFullRecipe);
router.patch("/:id", chefAuthMiddleware, validate({ params: recipeIdParamsSchema, body: updateRecipeBodySchema }), RecipeController.updateRecipe);
router.post("/", chefAuthMiddleware, validate({ body: createRecipeBodySchema }), RecipeController.createFullRecipe);
router.delete("/:id", chefAuthMiddleware, RecipeController.deleteRecipe);


export default router;
