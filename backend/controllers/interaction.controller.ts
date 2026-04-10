import type { Request, Response } from "express";
import * as InteractionModel from "../models/interaction.model.js";

export async function postReview(req: Request, res: Response) {
    const { recipe_id, user_id, vleresimi, komenti } = req.body;
    await InteractionModel.addReview(recipe_id, user_id, vleresimi, komenti);
    res.status(201).json({ success: true });
}

export async function handleFavorite(req: Request, res: Response) {
    const { user_id, recipe_id } = req.body;
    const result = await InteractionModel.toggleFavorite(user_id, recipe_id);
    res.json({ message: result });
}