import type { Request, Response } from "express";
import * as RecipeService from "./recipe.service.js";
import type { Id } from "../../common/types/index.js";

export async function getDashboard(req: Request, res: Response) {
    try {
        const data = await RecipeService.getDashboardData();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function createFullRecipe(req: Request, res: Response) {
    try {
        const id = await RecipeService.createRecipe(req.body);
        res.status(201).json({ id, message: "Recipe created successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function getRecipes(req: Request, res: Response) {
    try {
        const recipes = await RecipeService.fetchAllRecipes();
        res.json(recipes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export async function deleteRecipe(req: Request, res: Response) {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({ error: "Invalid recipe id" });
        }

        const recipeId = Number.parseInt(id, 10);

        if (!Number.isInteger(recipeId) || recipeId <= 0) {
            return res.status(400).json({ error: "Invalid recipe id" });
        }

        await RecipeService.removeRecipe(recipeId as Id);
        res.json({ message: "Recipe deleted" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}