import * as ShoppingModel from "../models/shopping.model.js";

export async function createFullList(userId: number, title: string, items: any[]) {
    const listId = await ShoppingModel.insertList(userId, title);
    for (const item of items) {
        await ShoppingModel.insertListItem(listId, item.ingredient_id, item.sasia);
    }
    return listId;
}