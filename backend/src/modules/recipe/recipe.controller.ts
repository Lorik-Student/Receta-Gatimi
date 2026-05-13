import type { Request, Response } from "express";
import * as RecipeService from "./recipe.service.js";
import { BadRequestError } from "../../common/http-errors.js";
import type { RequestWithClaims } from "../../common/middleware/auth.middleware.js";

export async function getDashboard(req: Request, res: Response) {
    const data = await RecipeService.getDashboardData();
    res.json(data);
}

export async function createFullRecipe(req: Request, res: Response) {
    const claims = (req as RequestWithClaims).claims;
    const userId = claims?.sub || claims?.id;
    
    if (!userId) {
        throw new BadRequestError("INVALID_USER", "Nuk mund të përcaktohet përdoruesi aktual");
    }

    const payload = {
        ...req.body,
        user_id: userId
    };

    const id = await RecipeService.createRecipe(payload);
    res.status(201).json({ id, message: "Recipe created successfully" });
}

export async function getRecipes(req: Request, res: Response) {
    const recipes = await RecipeService.fetchAllRecipes();
    res.json(recipes);
}

export async function getTags(req: Request, res: Response) {
    const tags = await RecipeService.fetchTags();
    res.json(tags);
}

export async function getRecipe(req: Request, res: Response) {
    const id = Number(req.params.id as string);
    if (Number.isNaN(id) || id <= 0) {
        throw new BadRequestError("INVALID_RECIPE_ID", "Invalid recipe id");
    }
    const recipe = await RecipeService.getRecipe(id);
    res.json(recipe);
}

export async function deleteRecipe(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id !== "string") {
        throw new BadRequestError("INVALID_RECIPE_ID", "Invalid recipe id");
    }

    const recipeId = Number.parseInt(id, 10);

    if (!Number.isInteger(recipeId) || recipeId <= 0) {
        throw new BadRequestError("INVALID_RECIPE_ID", "Invalid recipe id");
    }

    await RecipeService.removeRecipe(recipeId);
    res.json({ message: "Recipe deleted" });
}
