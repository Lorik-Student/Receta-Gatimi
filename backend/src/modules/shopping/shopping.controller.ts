import type { Request, Response } from "express";
import * as ShoppingService from "./shopping.service.js";
import { HttpError } from "../../common/http-errors.js";

export async function createShoppingList(req: Request, res: Response) {
  try {
    const { user_id, emertimi, items } = req.body;
    const id = await ShoppingService.createFullList(user_id, emertimi, items);
    res.status(201).json({ listId: id });
  } catch (error: any) {
    if (error?.code === "ER_NO_REFERENCED_ROW_2") {
      throw new HttpError(400, "Invalid foreign key reference in shopping list items", {
        code: "INVALID_REFERENCE",
        details: {
          sqlMessage: error.sqlMessage
        }
      });
    }

    throw error;
  }
}
