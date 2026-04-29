import type { Request, Response } from "express";
import * as InteractionService from "./interaction.service.js";
import { NotFoundError } from "../../common/http-errors.js";
// Utility to get user id from auth context or fallback to body/query
const getUserId = (req: Request): number => (req as any).user?.id || req.body.user_id || req.query.user_id;

export async function addReview(req: Request, res: Response) {
    const userId = getUserId(req);
    const { recipeId, vleresimi, komenti } = req.body;
    
    const id = await InteractionService.addReview({
        recipe_id: recipeId,
        user_id: userId,
        vleresimi,
        komenti
    });
    res.status(201).json({ id });
}

export async function getReviews(req: Request, res: Response) {
    const recipeId = Number(req.params.recipeId);
    const reviews = await InteractionService.getRecipeReviews(recipeId);
    res.json(reviews);
}

export async function modifyReview(req: Request, res: Response) {
    const reviewId = Number(req.params.id);
    const userId = getUserId(req);
    const { vleresimi, komenti } = req.body;

    const success = await InteractionService.modifyReview(reviewId, userId, vleresimi, komenti);
    if (!success) throw new NotFoundError("REVIEW_NOT_FOUND", "Review not found or unauthorized to update.");
    
    res.json({ message: "Review updated successfully." });
}

export async function removeReview(req: Request, res: Response) {
    const reviewId = Number(req.params.id);
    const userId = getUserId(req);

    const success = await InteractionService.removeReview(reviewId, userId);
    if (!success) throw new NotFoundError("REVIEW_NOT_FOUND", "Review not found or unauthorized to delete.");
    
    res.status(204).send();
}

export async function addFavorite(req: Request, res: Response) {
    const userId = getUserId(req);
    const { recipeId } = req.body;

    const id = await InteractionService.addFavorite(userId, recipeId);
    res.status(201).json({ id });
}

export async function getFavorites(req: Request, res: Response) {
    const userId = getUserId(req);
    const favorites = await InteractionService.getUserFavorites(userId);
    res.json(favorites);
}

export async function removeFavorite(req: Request, res: Response) {
    const userId = getUserId(req);
    const recipeId = Number(req.params.recipeId);

    const success = await InteractionService.removeFavorite(userId, recipeId);
    if (!success) throw new NotFoundError("FAVORITE_NOT_FOUND", "Favorite not found or unauthorized.");
    
    res.status(204).send();
}
