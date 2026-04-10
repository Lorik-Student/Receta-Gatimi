import { Router } from "express";
import * as RecipeController from "../controllers/recipe.controller.js";

const router = Router();

// Route for the Dashboard requirement
router.get("/dashboard", RecipeController.getDashboard);

export default router;