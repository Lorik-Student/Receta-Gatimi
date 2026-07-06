import * as InteractionModel from "./interaction.model.js";
import { NotFoundError } from "../../common/http-errors.js";
import type { Favorite, FavoriteCategoryWithRecipes, FavoriteRecipeItem, Review } from "../../common/types/recipe.types.js";
import * as NotificationService from "../notification/notification.service.js";
import * as RecipeModel from "../recipe/recipe.model.js";
import * as UserModel from "../user/user.model.js";
import type { BugReportRecord, RecipeReportRecord, UserReportRecord } from "../../common/types/report.types.js";

export async function addReview(review: Omit<Review, "id" | "data">): Promise<number> {
    const id = await InteractionModel.insertReview(review);

    try {
        await NotificationService.createRecipeActivityNotification(review.recipe_id, review.user_id, "review", review.vleresimi);
    } catch (error) {
        console.error("Failed to create review notification:", error);
    }

    return id;
}

export async function getRecipeReviews(recipeId: number): Promise<Review[]> {
    return InteractionModel.getReviewsByRecipe(recipeId);
}

export async function getAllReviews(): Promise<Review[]> {
    return InteractionModel.getAllReviews();
}

export async function modifyReview(reviewId: number, userId: number, vleresimi: number, komenti: string): Promise<boolean> {
    return InteractionModel.updateReview(reviewId, userId, vleresimi, komenti);
}

export async function modifyReviewAsAdmin(reviewId: number, vleresimi: number, komenti: string): Promise<boolean> {
    return InteractionModel.updateReviewById(reviewId, vleresimi, komenti);
}

export async function removeReview(reviewId: number, userId: number): Promise<boolean> {
    return InteractionModel.deleteReview(reviewId, userId);
}

export async function removeReviewAsAdmin(reviewId: number): Promise<boolean> {
    return InteractionModel.deleteReviewById(reviewId);
}

export async function addRecipeReport(userId: number, recipeId: number, reason: string): Promise<{ id: number; created: boolean; hidden: boolean }> {
    const recipe = await RecipeModel.getRecipeByIdForAdmin(recipeId);
    if (!recipe) {
        throw new NotFoundError("RECIPE_NOT_FOUND", "Recipe not found");
    }

    if (Number(recipe.user_id) === userId) {
        throw new NotFoundError("INVALID_REPORT_TARGET", "You cannot report your own recipe.");
    }

    return InteractionModel.insertRecipeReport(userId, recipeId, reason);
}

export async function addUserReport(userId: number, reportedUserId: number, reason: string): Promise<{ id: number; created: boolean }> {
    const reportedUser = await UserModel.findUser(reportedUserId);
    if (!reportedUser) {
        throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }

    if (reportedUserId === userId) {
        throw new NotFoundError("INVALID_REPORT_TARGET", "You cannot report yourself.");
    }

    return InteractionModel.insertUserReport(userId, reportedUserId, reason);
}

export async function getRecipeReports(): Promise<RecipeReportRecord[]> {
    return InteractionModel.getPendingRecipeReports();
}

export async function getUserReports(): Promise<UserReportRecord[]> {
    return InteractionModel.getPendingUserReports();
}

export async function keepRecipeAfterReports(recipeId: number, adminUserId: number): Promise<boolean> {
    const restored = await RecipeModel.restoreRecipeVisibility(recipeId);
    if (!restored) {
        throw new NotFoundError("RECIPE_NOT_FOUND", "Recipe not found");
    }

    await InteractionModel.dismissRecipeReports(recipeId, adminUserId);
    return true;
}

export async function removeRecipeAfterReports(recipeId: number): Promise<boolean> {
    const recipe = await RecipeModel.getRecipeByIdForAdmin(recipeId);
    if (!recipe) {
        throw new NotFoundError("RECIPE_NOT_FOUND", "Recipe not found");
    }

    await RecipeModel.deleteRecipe(recipeId);
    return true;
}

export async function dismissUserAfterReports(userId: number, adminUserId: number): Promise<boolean> {
    const user = await UserModel.findUser(userId);
    if (!user) {
        throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }

    await InteractionModel.dismissUserReports(userId, adminUserId);
    return true;
}

export async function addBugReport(userId: number, subject: string, message: string): Promise<{ id: number; created: boolean }> {
    return InteractionModel.insertBugReport(userId, subject, message);
}

export async function getBugReports(): Promise<BugReportRecord[]> {
    return InteractionModel.getPendingBugReports();
}

export async function resolveBugReport(bugReportId: number, adminUserId: number): Promise<boolean> {
    const resolved = await InteractionModel.resolveBugReport(bugReportId, adminUserId);
    if (!resolved) {
        throw new NotFoundError("BUG_REPORT_NOT_FOUND", "Bug report not found");
    }

    return true;
}


export async function addFavorite(userId: number, recipeId: number): Promise<{ favoriteId: number; created: boolean }> {
    const existingFavorite = await InteractionModel.findFavoriteByRecipe(userId, recipeId);
    if (existingFavorite) {
        return { favoriteId: existingFavorite.id, created: false };
    }

    const favoriteId = await InteractionModel.insertFavorite(userId, recipeId);
    return { favoriteId, created: true };
}

function groupFavoriteRows(rows: Array<Record<string, unknown>>): FavoriteCategoryWithRecipes[] {
    const categories = new Map<number, FavoriteCategoryWithRecipes>();

    for (const row of rows) {
        const categoryId = Number(row.category_id);
        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            continue;
        }

        if (!categories.has(categoryId)) {
            categories.set(categoryId, {
                id: categoryId,
                user_id: Number(row.user_id),
                emertimi: String(row.category_name),
                is_public: Boolean(row.is_public),
                imazhi: typeof row.imazhi === "string" ? row.imazhi : undefined,
                data_krijimit: new Date(String(row.data_krijimit)),
                recipes: []
            });
        }

        if (row.favorite_id && row.recipe_id && row.titulli) {
            const favoriteRecipe: FavoriteRecipeItem = {
                favorite_id: Number(row.favorite_id),
                recipe_id: Number(row.recipe_id),
                titulli: String(row.titulli),
                data: new Date(String(row.data))
            };

            if (row.imazhi) {
                favoriteRecipe.imazhi = String(row.imazhi);
            }

            categories.get(categoryId)?.recipes.push(favoriteRecipe);
        }
    }

    return Array.from(categories.values());
}

export async function addFavoriteToCategory(userId: number, recipeId: number, categoryId?: number): Promise<{ favoriteId: number; linkedCategoryId?: number }> {
    if (categoryId) {
        const category = await InteractionModel.findFavoriteCategoryByIdAndOwner(categoryId, userId);
        if (!category) {
            throw new NotFoundError("FAVORITE_CATEGORY_NOT_FOUND", "Favorite category not found.");
        }
    }

    const { favoriteId, created } = await addFavorite(userId, recipeId);

    if (created) {
        void NotificationService.createRecipeActivityNotification(recipeId, userId, "favorite")
            .catch((error) => {
                console.error("Failed to create favorite notification:", error);
            });
    }

    if (!categoryId) {
        return { favoriteId };
    }

    await InteractionModel.insertFavoriteInCategory(categoryId, favoriteId);
    return { favoriteId, linkedCategoryId: categoryId };
}

export async function getUserFavorites(userId: number): Promise<{ categories: FavoriteCategoryWithRecipes[]; uncategorized: FavoriteRecipeItem[] }> {
    const [categorizedRows, uncategorized] = await Promise.all([
        InteractionModel.getCategorizedFavoritesForOwner(userId),
        InteractionModel.getUncategorizedFavoritesByUser(userId)
    ]);

    return {
        categories: groupFavoriteRows(categorizedRows as Array<Record<string, unknown>>),
        uncategorized
    };
}

export async function getFavoriteCategories(userId: number) {
    return InteractionModel.getFavoriteCategoriesByUser(userId);
}

export async function getPublicFavoriteCategories(userId: number): Promise<{ categories: FavoriteCategoryWithRecipes[] }> {
    const categorizedRows = await InteractionModel.getCategorizedPublicFavoritesByUser(userId);

    return {
        categories: groupFavoriteRows(categorizedRows as Array<Record<string, unknown>>)
    };
}

export async function createFavoriteCategory(userId: number, emertimi: string, isPublic: boolean): Promise<number> {
    return InteractionModel.insertFavoriteCategory(userId, emertimi, isPublic);
}

export async function updateFavoriteCategory(userId: number, categoryId: number, data: { emertimi?: string; pershkrimi?: string | null; is_public?: boolean }): Promise<boolean> {
    const category = await InteractionModel.findFavoriteCategoryByIdAndOwner(categoryId, userId);
    if (!category) {
        throw new NotFoundError("FAVORITE_CATEGORY_NOT_FOUND", "Favorite category not found.");
    }

    return InteractionModel.updateFavoriteCategory(userId, categoryId, data);
}

export async function deleteFavoriteCategory(userId: number, categoryId: number): Promise<boolean> {
    const category = await InteractionModel.findFavoriteCategoryByIdAndOwner(categoryId, userId);
    if (!category) {
        throw new NotFoundError("FAVORITE_CATEGORY_NOT_FOUND", "Favorite category not found.");
    }

    return InteractionModel.deleteFavoriteCategory(userId, categoryId);
}

export async function removeFavorite(userId: number, recipeId: number): Promise<boolean> {
    return InteractionModel.removeFavorite(userId, recipeId);
}
