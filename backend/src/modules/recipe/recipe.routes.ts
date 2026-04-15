import { Router } from "express";
import * as RecipeController from "./recipe.controller.js";

const router = Router();

// Dashboard
router.get("/dashboard", RecipeController.getDashboard);

// Recipe Management
router.get("/", RecipeController.getRecipes);
router.post("/", RecipeController.createFullRecipe);
router.delete("/:id", RecipeController.deleteRecipe);


export default router;