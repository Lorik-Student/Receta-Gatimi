import * as InteractionModel from "./interaction.model.js";
import type { Review, Favorite } from "../../common/types/recipe.types.js";

export async function addReview(review: Omit<Review, "id" | "data">): Promise<number> {
    return InteractionModel.insertReview(review);
}

export async function getRecipeReviews(recipeId: number): Promise<Review[]> {
    return InteractionModel.getReviewsByRecipe(recipeId);
}

export async function modifyReview(reviewId: number, userId: number, vleresimi: number, komenti: string): Promise<boolean> {
    return InteractionModel.updateReview(reviewId, userId, vleresimi, komenti);
}

export async function removeReview(reviewId: number, userId: number): Promise<boolean> {
    return InteractionModel.deleteReview(reviewId, userId);
}


export async function addFavorite(userId: number, recipeId: number): Promise<number> {
    return InteractionModel.insertFavorite(userId, recipeId);
}

export async function getUserFavorites(userId: number): Promise<any[]> {
    return InteractionModel.getFavoritesByUser(userId);
}

export async function removeFavorite(userId: number, recipeId: number): Promise<boolean> {
    return InteractionModel.removeFavorite(userId, recipeId);
}
