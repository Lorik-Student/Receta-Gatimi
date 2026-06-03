import type { Request, Response } from "express";
import * as ShoppingService from "./shopping.service.js";
import { BadRequestError, NotFoundError } from "../../common/http-errors.js";
import type { RequestWithClaims } from "../../common/middleware/auth.middleware.js";

function getUserId(req: Request): number {
  const claims = (req as RequestWithClaims).claims;
  const userId = Number((req as any).user?.id || claims?.sub || claims?.id || req.body.userId || req.query.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new BadRequestError("INVALID_USER", "Nuk mund të përcaktohet përdoruesi aktual");
  }

  return userId;
}

function getPositiveId(value: unknown, code: string, message: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(code, message);
  }

  return parsed;
}

export async function createShoppingList(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    const { emertimi, items } = req.body;
    const id = await ShoppingService.createFullList(userId, emertimi, items);
    res.status(201).json({ listId: id });
  } catch (error: any) {
    if (error?.code === "ER_NO_REFERENCED_ROW_2") {
      throw new BadRequestError("INVALID_REFERENCE", "Invalid foreign key reference in shopping list items", {
        details: {
          sqlMessage: error.sqlMessage
        }
      });
    }

    throw error;
  }
}

export async function getUserShoppingLists(req: Request, res: Response) {
    const userId = getUserId(req);
    const lists = await ShoppingService.getUserLists(userId);
    res.json(lists);
}

export async function getDefaultShoppingList(req: Request, res: Response) {
  const userId = getUserId(req);
  const shoppingList = await ShoppingService.getDefaultShoppingList(userId);
  res.json({ success: true, shoppingList });
}

export async function addRecipeIngredientsToShoppingList(req: Request, res: Response) {
  const userId = getUserId(req);
  const recipeId = getPositiveId(req.body.recipeId, "INVALID_RECIPE_ID", "Invalid recipe id");
  const ingredientIds = Array.isArray(req.body.ingredientIds)
    ? req.body.ingredientIds.map((value: unknown) => getPositiveId(value, "INVALID_INGREDIENT_ID", "Invalid ingredient id"))
    : undefined;

  const shoppingList = await ShoppingService.addRecipeIngredientsToDefaultList(userId, recipeId, ingredientIds);
  res.status(201).json({ success: true, shoppingList });
}

export async function updateShoppingList(req: Request, res: Response) {
  const listId = getPositiveId(req.params.id, "INVALID_LIST_ID", "Invalid list id");
    const userId = getUserId(req);
    const { emertimi } = req.body;

    const success = await ShoppingService.updateShoppingList(listId, userId, emertimi);
    if (!success) throw new NotFoundError("LIST_NOT_FOUND", "List not found or unauthorized to update.");

    res.json({ message: "Shopping List updated successfully." });
}

export async function deleteShoppingList(req: Request, res: Response) {
  const listId = getPositiveId(req.params.id, "INVALID_LIST_ID", "Invalid list id");
    const userId = getUserId(req);

    const success = await ShoppingService.deleteShoppingList(listId, userId);
    if (!success) throw new NotFoundError("LIST_NOT_FOUND", "List not found or unauthorized to delete.");

    res.status(204).send();
}

// ITEMS

export async function getShoppingListItems(req: Request, res: Response) {
  const listId = getPositiveId(req.params.listId, "INVALID_LIST_ID", "Invalid list id");
    const items = await ShoppingService.getItems(listId);
    res.json(items);
}

export async function addShoppingListItem(req: Request, res: Response) {
  const listId = getPositiveId(req.params.listId, "INVALID_LIST_ID", "Invalid list id");
    const { ingredientId, amount } = req.body;

  const parsedIngredientId = getPositiveId(ingredientId, "INVALID_INGREDIENT_ID", "Invalid ingredient id");

  const itemId = await ShoppingService.addItem(listId, parsedIngredientId, String(amount));
    res.status(201).json({ itemId });
}

export async function updateShoppingListItem(req: Request, res: Response) {
  const listId = getPositiveId(req.params.listId, "INVALID_LIST_ID", "Invalid list id");
  const itemId = getPositiveId(req.params.itemId, "INVALID_ITEM_ID", "Invalid item id");
    const { amount, isBought } = req.body;

  const success = await ShoppingService.editItem(itemId, listId, String(amount), Boolean(isBought));
    if (!success) throw new NotFoundError("ITEM_NOT_FOUND", "Item not found or update failed.");

    res.json({ message: "Item updated successfully." });
}

export async function deleteShoppingListItem(req: Request, res: Response) {
  const listId = getPositiveId(req.params.listId, "INVALID_LIST_ID", "Invalid list id");
  const itemId = getPositiveId(req.params.itemId, "INVALID_ITEM_ID", "Invalid item id");

    const success = await ShoppingService.removeItem(itemId, listId);
    if (!success) throw new NotFoundError("ITEM_NOT_FOUND", "Item not found or deletion failed.");

    res.status(204).send();
}
