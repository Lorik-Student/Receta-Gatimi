import { Router } from "express";
import * as ShoppingController from "./shopping.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { createShoppingListBodySchema } from "./shopping.schema.js";
import { userAuthMiddleware } from "../../common/middleware/auth.middleware.js";

const router = Router();    

router.get("/", userAuthMiddleware, ShoppingController.getUserShoppingLists);
router.post("/", userAuthMiddleware, validate({ body: createShoppingListBodySchema }), ShoppingController.createShoppingList);
router.patch("/:id", userAuthMiddleware, ShoppingController.updateShoppingList);
router.delete("/:id", userAuthMiddleware, ShoppingController.deleteShoppingList);

// ITEMS
router.get("/:listId/items", userAuthMiddleware, ShoppingController.getShoppingListItems);
router.post("/:listId/items", userAuthMiddleware, ShoppingController.addShoppingListItem);
router.patch("/:listId/items/:itemId", userAuthMiddleware, ShoppingController.updateShoppingListItem);
router.delete("/:listId/items/:itemId", userAuthMiddleware, ShoppingController.deleteShoppingListItem);

export default router;