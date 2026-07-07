import type { Request, Response } from "express";
import * as InteractionService from "./interaction.service.js";
import { BadRequestError, NotFoundError } from "../../common/http-errors.js";
import type { RequestWithClaims } from "../../common/middleware/auth.middleware.js";

function getAuthenticatedUserId(req: Request): number {
    const claims = (req as RequestWithClaims).claims;
    const rawUserId = claims?.sub ?? (claims as Record<string, unknown> | undefined)?.id;
    const userId = typeof rawUserId === "string" ? Number.parseInt(rawUserId, 10) : Number(rawUserId);

    if (!Number.isInteger(userId) || userId <= 0) {
        throw new BadRequestError("INVALID_USER", "Nuk mund të përcaktohet përdoruesi aktual");
    }

    return userId;
}

export async function addReview(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const { recipe_id, vleresimi, komenti = "" } = req.body;
    
    const id = await InteractionService.addReview({
        recipe_id,
        user_id: userId,
        vleresimi,
        komenti
    });
    res.status(201).json({ id, message: "Review added successfully" });
}

export async function getReviews(req: Request, res: Response) {
    const recipeId = Number(req.params.recipeId);
    const reviews = await InteractionService.getRecipeReviews(recipeId);
    res.json({ reviews });
}

export async function getAllReviews(req: Request, res: Response) {
    const reviews = await InteractionService.getAllReviews();
    res.json({ reviews });
}

export async function modifyReview(req: Request, res: Response) {
    const reviewId = Number(req.params.id);
    const userId = getAuthenticatedUserId(req);
    const { vleresimi, komenti = "" } = req.body;

    const success = await InteractionService.modifyReview(reviewId, userId, vleresimi, komenti);
    if (!success) throw new NotFoundError("REVIEW_NOT_FOUND", "Review not found or unauthorized to update.");
    
    res.json({ message: "Review updated successfully." });
}

export async function modifyReviewAsAdmin(req: Request, res: Response) {
    const reviewId = Number(req.params.id);
    const { vleresimi, komenti = "" } = req.body;

    const success = await InteractionService.modifyReviewAsAdmin(reviewId, vleresimi, komenti);
    if (!success) throw new NotFoundError("REVIEW_NOT_FOUND", "Review not found.");

    res.json({ message: "Review updated successfully." });
}

export async function removeReview(req: Request, res: Response) {
    const reviewId = Number(req.params.id);
    const userId = getAuthenticatedUserId(req);

    const success = await InteractionService.removeReview(reviewId, userId);
    if (!success) throw new NotFoundError("REVIEW_NOT_FOUND", "Review not found or unauthorized to delete.");
    
    res.status(204).send();
}

export async function removeReviewAsAdmin(req: Request, res: Response) {
    const reviewId = Number(req.params.id);

    const success = await InteractionService.removeReviewAsAdmin(reviewId);
    if (!success) throw new NotFoundError("REVIEW_NOT_FOUND", "Review not found.");

    res.status(204).send();
}

export async function addRecipeReport(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const { recipe_id, reason } = req.body;

    const result = await InteractionService.addRecipeReport(userId, recipe_id, reason);
    res.status(result.created ? 201 : 200).json({ id: result.id, created: result.created, hidden: result.hidden, message: result.created ? "Recipe report submitted" : "Recipe report already exists" });
}

export async function addUserReport(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const { user_id, reason } = req.body;

    const result = await InteractionService.addUserReport(userId, user_id, reason);
    res.status(result.created ? 201 : 200).json({ id: result.id, created: result.created, message: result.created ? "User report submitted" : "User report already exists" });
}

export async function addBugReport(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const { subject, message } = req.body;

    const result = await InteractionService.addBugReport(userId, subject, message);
    res.status(result.created ? 201 : 200).json({ id: result.id, created: result.created, message: result.created ? "Bug report submitted" : "Bug report already exists" });
}

export async function getRecipeReports(req: Request, res: Response) {
    const reports = await InteractionService.getRecipeReports();
    res.json({ reports });
}

export async function getUserReports(req: Request, res: Response) {
    const reports = await InteractionService.getUserReports();
    res.json({ reports });
}

export async function getBugReports(req: Request, res: Response) {
    const reports = await InteractionService.getBugReports();
    res.json({ reports });
}

export async function keepRecipeAfterReports(req: Request, res: Response) {
    const recipeId = Number(req.params.recipeId);
    const adminUserId = getAuthenticatedUserId(req);

    const success = await InteractionService.keepRecipeAfterReports(recipeId, adminUserId);
    if (!success) {
        throw new NotFoundError("RECIPE_NOT_FOUND", "Recipe not found");
    }

    res.json({ message: "Recipe restored and reports dismissed" });
}

export async function removeRecipeAfterReports(req: Request, res: Response) {
    const recipeId = Number(req.params.recipeId);

    const success = await InteractionService.removeRecipeAfterReports(recipeId);
    if (!success) {
        throw new NotFoundError("RECIPE_NOT_FOUND", "Recipe not found");
    }

    res.status(204).send();
}

export async function dismissUserAfterReports(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const adminUserId = getAuthenticatedUserId(req);

    const success = await InteractionService.dismissUserAfterReports(userId, adminUserId);
    if (!success) {
        throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }

    res.json({ message: "User reports dismissed" });
}

export async function resolveBugReport(req: Request, res: Response) {
    const bugReportId = Number(req.params.bugReportId);
    const adminUserId = getAuthenticatedUserId(req);

    const success = await InteractionService.resolveBugReport(bugReportId, adminUserId);
    if (!success) {
        throw new NotFoundError("BUG_REPORT_NOT_FOUND", "Bug report not found");
    }

    res.json({ message: "Bug report resolved" });
}

export async function addFavorite(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const { recipeId, categoryId } = req.body;

    const result = await InteractionService.addFavoriteToCategory(userId, recipeId, categoryId);
    res.status(201).json({ id: result.favoriteId, categoryId: result.linkedCategoryId });
}

export async function getFavorites(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const favorites = await InteractionService.getUserFavorites(userId);
    res.json({ favorites });
}

export async function getFavoriteCategories(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const categories = await InteractionService.getFavoriteCategories(userId);
    res.json({ categories });
}

export async function getPublicFavoriteCategories(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const data = await InteractionService.getPublicFavoriteCategories(userId);
    res.json(data);
}

export async function createFavoriteCategory(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const { emertimi, is_public = false } = req.body;

    const id = await InteractionService.createFavoriteCategory(userId, emertimi, Boolean(is_public));
    res.status(201).json({ id, message: "Favorite category created" });
}

export async function updateFavoriteCategory(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const categoryId = Number(req.params.id);
    const { emertimi, pershkrimi, is_public } = req.body;

    const normalizedDescription = typeof pershkrimi === "string" ? pershkrimi.trim() : undefined;

    const updatePayload: { emertimi?: string; pershkrimi?: string | null; is_public?: boolean } = {};
    if (emertimi !== undefined) {
        updatePayload.emertimi = emertimi;
    }
    if (normalizedDescription !== undefined) {
        updatePayload.pershkrimi = normalizedDescription.length > 0 ? normalizedDescription : null;
    }
    if (is_public !== undefined) {
        updatePayload.is_public = is_public;
    }

    const updated = await InteractionService.updateFavoriteCategory(userId, categoryId, updatePayload);
    if (!updated) {
        throw new NotFoundError("FAVORITE_CATEGORY_NOT_FOUND", "Favorite category not found.");
    }

    res.json({ message: "Favorite category updated" });
}

export async function deleteFavoriteCategory(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const categoryId = Number(req.params.id);

    const deleted = await InteractionService.deleteFavoriteCategory(userId, categoryId);
    if (!deleted) {
        throw new NotFoundError("FAVORITE_CATEGORY_NOT_FOUND", "Favorite category not found.");
    }

    res.status(204).send();
}

export async function removeFavorite(req: Request, res: Response) {
    const userId = getAuthenticatedUserId(req);
    const recipeId = Number(req.params.recipeId);

    const success = await InteractionService.removeFavorite(userId, recipeId);
    if (!success) throw new NotFoundError("FAVORITE_NOT_FOUND", "Favorite not found or unauthorized.");
    
    res.status(204).send();
}
