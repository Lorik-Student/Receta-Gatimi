import { Router } from "express";
import * as InteractionController from "./interaction.controller.js";
import { adminAuthMiddleware, userAuthMiddleware } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import {
	favoriteBodySchema,
	favoriteCategoryBodySchema,
	favoriteCategoryParamsSchema,
	favoriteCategoryUpdateBodySchema,
	favoriteRecipeParamsSchema,
	publicFavoriteUserParamsSchema,
	recipeReviewParamsSchema,
	recipeReportBodySchema,
	recipeReportParamsSchema,
	reviewBodySchema,
	reviewIdParamsSchema,
	reviewUpdateBodySchema,
	userReportBodySchema,
	bugReportBodySchema,
	bugReportParamsSchema,
	userReportParamsSchema
} from "./interaction.schema.js";

const router = Router();

// Reviews
router.post("/reviews", userAuthMiddleware, validate({ body: reviewBodySchema }), InteractionController.addReview);
router.get("/reviews/recipe/:recipeId", validate({ params: recipeReviewParamsSchema }), InteractionController.getReviews);
router.patch("/reviews/:id", userAuthMiddleware, validate({ params: reviewIdParamsSchema, body: reviewUpdateBodySchema }), InteractionController.modifyReview);
router.delete("/reviews/:id", userAuthMiddleware, validate({ params: reviewIdParamsSchema }), InteractionController.removeReview);

// Reports
router.post("/reports/recipes", userAuthMiddleware, validate({ body: recipeReportBodySchema }), InteractionController.addRecipeReport);
router.post("/reports/users", userAuthMiddleware, validate({ body: userReportBodySchema }), InteractionController.addUserReport);
router.post("/reports/bugs", userAuthMiddleware, validate({ body: bugReportBodySchema }), InteractionController.addBugReport);
router.get("/reports/recipes", adminAuthMiddleware, InteractionController.getRecipeReports);
router.get("/reports/users", adminAuthMiddleware, InteractionController.getUserReports);
router.get("/reports/bugs", adminAuthMiddleware, InteractionController.getBugReports);
router.patch("/reports/recipes/:recipeId/keep", adminAuthMiddleware, validate({ params: recipeReportParamsSchema }), InteractionController.keepRecipeAfterReports);
router.delete("/reports/recipes/:recipeId", adminAuthMiddleware, validate({ params: recipeReportParamsSchema }), InteractionController.removeRecipeAfterReports);
router.patch("/reports/users/:userId/dismiss", adminAuthMiddleware, validate({ params: userReportParamsSchema }), InteractionController.dismissUserAfterReports);
router.patch("/reports/bugs/:bugReportId/resolve", adminAuthMiddleware, validate({ params: bugReportParamsSchema }), InteractionController.resolveBugReport);

// Favorites
router.post("/favorites", userAuthMiddleware, validate({ body: favoriteBodySchema }), InteractionController.addFavorite);
router.get("/favorites", userAuthMiddleware, InteractionController.getFavorites);
router.get("/favorites/categories", userAuthMiddleware, InteractionController.getFavoriteCategories);
router.get("/favorites/public/user/:userId", validate({ params: publicFavoriteUserParamsSchema }), InteractionController.getPublicFavoriteCategories);
router.post("/favorites/categories", userAuthMiddleware, validate({ body: favoriteCategoryBodySchema }), InteractionController.createFavoriteCategory);
router.patch("/favorites/categories/:id", userAuthMiddleware, validate({ params: favoriteCategoryParamsSchema, body: favoriteCategoryUpdateBodySchema }), InteractionController.updateFavoriteCategory);
router.delete("/favorites/categories/:id", userAuthMiddleware, validate({ params: favoriteCategoryParamsSchema }), InteractionController.deleteFavoriteCategory);
router.delete("/favorites/recipe/:recipeId", userAuthMiddleware, validate({ params: favoriteRecipeParamsSchema }), InteractionController.removeFavorite);

export default router;
