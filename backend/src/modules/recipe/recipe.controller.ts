import type { Request, Response } from "express";
import * as RecipeService from "./recipe.service.js";

export async function getDashboard(req: Request, res: Response) {
    try {
        const data = await RecipeService.getDashboardData();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}