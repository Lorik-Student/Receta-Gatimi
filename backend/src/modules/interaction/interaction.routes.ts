import { Router } from "express";
import * as InteractionController from "./interaction.controller.js";
import { userAuthMiddleware } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.middleware.js";

const router = Router();

// Reviews
router.post("/reviews", userAuthMiddleware, InteractionController.addReview);
router.get("/reviews/recipe/:recipeId", InteractionController.getReviews);
router.patch("/reviews/:id", userAuthMiddleware, InteractionController.modifyReview);
router.delete("/reviews/:id", userAuthMiddleware, InteractionController.removeReview);

// Favorites
router.post("/favorites", userAuthMiddleware, InteractionController.addFavorite);
router.get("/favorites", userAuthMiddleware, InteractionController.getFavorites);
router.delete("/favorites/recipe/:recipeId", userAuthMiddleware, InteractionController.removeFavorite);

export default router;
