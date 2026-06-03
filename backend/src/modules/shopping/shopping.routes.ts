import { Router } from "express";
import * as ShoppingController from "./shopping.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { createShoppingListBodySchema, recipeShoppingItemsBodySchema, shoppingListIdParamsSchema, shoppingListItemParamsSchema, shoppingListItemsParamsSchema, updateShoppingListBodySchema, updateShoppingListItemBodySchema } from "./shopping.schema.js";
import { userAuthMiddleware } from "../../common/middleware/auth.middleware.js";

const router = Router();    

router.get("/", userAuthMiddleware, ShoppingController.getUserShoppingLists);
router.get("/current", userAuthMiddleware, ShoppingController.getDefaultShoppingList);
router.post("/", userAuthMiddleware, validate({ body: createShoppingListBodySchema }), ShoppingController.createShoppingList);
router.post("/current/items/from-recipe", userAuthMiddleware, validate({ body: recipeShoppingItemsBodySchema }), ShoppingController.addRecipeIngredientsToShoppingList);
router.patch("/:id", userAuthMiddleware, validate({ params: shoppingListIdParamsSchema, body: updateShoppingListBodySchema }), ShoppingController.updateShoppingList);
router.delete("/:id", userAuthMiddleware, validate({ params: shoppingListIdParamsSchema }), ShoppingController.deleteShoppingList);

// ITEMS
router.get("/:listId/items", userAuthMiddleware, validate({ params: shoppingListItemsParamsSchema }), ShoppingController.getShoppingListItems);
router.post("/:listId/items", userAuthMiddleware, validate({ params: shoppingListItemsParamsSchema }), ShoppingController.addShoppingListItem);
router.patch("/:listId/items/:itemId", userAuthMiddleware, validate({ params: shoppingListItemParamsSchema, body: updateShoppingListItemBodySchema }), ShoppingController.updateShoppingListItem);
router.delete("/:listId/items/:itemId", userAuthMiddleware, validate({ params: shoppingListItemParamsSchema }), ShoppingController.deleteShoppingListItem);

export default router;