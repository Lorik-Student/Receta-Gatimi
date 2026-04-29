import type { Request, Response } from "express";
import * as ShoppingService from "./shopping.service.js";
import { HttpError, BadRequestError, NotFoundError } from "../../common/http-errors.js";
const getUserId = (req: Request): number => (req as any).user?.id || req.body.userId || req.query.userId;

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

export async function updateShoppingList(req: Request, res: Response) {
    const listId = Number(req.params.id);
    const userId = getUserId(req);
    const { emertimi } = req.body;

    const success = await ShoppingService.updateShoppingList(listId, userId, emertimi);
    if (!success) throw new NotFoundError("LIST_NOT_FOUND", "List not found or unauthorized to update.");

    res.json({ message: "Shopping List updated successfully." });
}

export async function deleteShoppingList(req: Request, res: Response) {
    const listId = Number(req.params.id);
    const userId = getUserId(req);

    const success = await ShoppingService.deleteShoppingList(listId, userId);
    if (!success) throw new NotFoundError("LIST_NOT_FOUND", "List not found or unauthorized to delete.");

    res.status(204).send();
}

// ITEMS

export async function getShoppingListItems(req: Request, res: Response) {
    const listId = Number(req.params.listId);
    const items = await ShoppingService.getItems(listId);
    res.json(items);
}

export async function addShoppingListItem(req: Request, res: Response) {
    const listId = Number(req.params.listId);
    const { ingredientId, amount } = req.body;

    const itemId = await ShoppingService.addItem(listId, ingredientId, amount);
    res.status(201).json({ itemId });
}

export async function updateShoppingListItem(req: Request, res: Response) {
    const listId = Number(req.params.listId);
    const itemId = Number(req.params.itemId);
    const { amount, isBought } = req.body;

    const success = await ShoppingService.editItem(itemId, listId, amount, isBought);
    if (!success) throw new NotFoundError("ITEM_NOT_FOUND", "Item not found or update failed.");

    res.json({ message: "Item updated successfully." });
}

export async function deleteShoppingListItem(req: Request, res: Response) {
    const listId = Number(req.params.listId);
    const itemId = Number(req.params.itemId);

    const success = await ShoppingService.removeItem(itemId, listId);
    if (!success) throw new NotFoundError("ITEM_NOT_FOUND", "Item not found or deletion failed.");

    res.status(204).send();
}
