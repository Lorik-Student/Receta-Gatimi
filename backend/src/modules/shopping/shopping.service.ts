import * as ShoppingModel from "./shopping.model.js";
import type {  ShoppingList, ListItem } from "../../common/types/index.js";


export async function createFullList(userId: number, title: string, items: any[]): Promise<number> {
    const listId = await ShoppingModel.insertList(userId, title);
    if (items && items.length > 0) {
        for (const item of items) {
            await ShoppingModel.insertListItem(listId, item.ingredient_id, item.sasia);
        }
    }
    return listId;
}

export async function getUserLists(userId: number): Promise<ShoppingList[]> {
    return ShoppingModel.getListsByUser(userId);
}

export async function updateShoppingList(listId: number, userId: number, title: string): Promise<boolean> {
    return ShoppingModel.updateList(listId, userId, title);
}

export async function deleteShoppingList(listId: number, userId: number): Promise<boolean> {
    return ShoppingModel.deleteList(listId, userId);
}


export async function getItems(listId: number): Promise<ListItem[]> {
    return ShoppingModel.getListItems(listId);
}

export async function addItem(listId: number, ingredientId: number, amount: string): Promise<number> {
    return ShoppingModel.insertListItem(listId, ingredientId, amount);
}

export async function editItem(itemId: number, listId: number, amount: string, isBought: boolean): Promise<boolean> {
    return ShoppingModel.updateListItem(itemId, listId, amount, isBought);
}

export async function removeItem(itemId: number, listId: number): Promise<boolean> {
    return ShoppingModel.deleteListItem(itemId, listId);
}