import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type {  ShoppingList, ListItem } from "../../common/types/index.js";

// -- LISTS --

export async function insertList(user_id: number, title: string): Promise<number> {
    const [res] = await db.query<ResultSetHeader>("INSERT INTO ShoppingList (user_id, emertimi) VALUES (?, ?)", [user_id, title]);
    return res.insertId;
}

export async function getListsByUser(user_id: number): Promise<ShoppingList[]> {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM ShoppingList WHERE user_id = ? ORDER BY data_krijimit DESC", [user_id]);
    return rows as ShoppingList[];
}

export async function updateList(list_id: number, user_id: number, newTitle: string): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "UPDATE ShoppingList SET emertimi = ? WHERE id = ? AND user_id = ?",
        [newTitle, list_id, user_id]
    );
    return res.affectedRows > 0;
}

export async function deleteList(list_id: number, user_id: number): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>("DELETE FROM ShoppingList WHERE id = ? AND user_id = ?", [list_id, user_id]);
    return res.affectedRows > 0;
}

// -- ITEMS --

export async function insertListItem(list_id: number, ingredient_id: number, amount: string): Promise<number> {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO ShoppingListItems (shopping_list_id, ingredient_id, sasia) VALUES (?, ?, ?)",
        [list_id, ingredient_id, amount]
    );
    return res.insertId;
}

export async function getListItems(list_id: number): Promise<ListItem[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM ShoppingListItems WHERE shopping_list_id = ?",
        [list_id]
    );
    return rows as ListItem[];
}

export async function updateListItem(item_id: number, list_id: number, amount: string, is_bought: boolean): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "UPDATE ShoppingListItems SET sasia = ?, eshte_blere = ? WHERE id = ? AND shopping_list_id = ?",
        [amount, is_bought, item_id, list_id]
    );
    return res.affectedRows > 0;
}

export async function deleteListItem(item_id: number, list_id: number): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "DELETE FROM ShoppingListItems WHERE id = ? AND shopping_list_id = ?",
        [item_id, list_id]
    );
    return res.affectedRows > 0;
}