import db from "../../config/db.js";
import type { ResultSetHeader } from "mysql2";

export async function insertList(user_id: number, title: string) {
    const [res] = await db.query<ResultSetHeader>("INSERT INTO ShoppingList (user_id, emertimi) VALUES (?, ?)", [user_id, title]);
    return res.insertId;
}

export async function insertListItem(list_id: number, ingredient_id: number, amount: string) {
    await db.query("INSERT INTO ShoppingListItems (shopping_list_id, ingredient_id, sasia) VALUES (?, ?, ?)", [list_id, ingredient_id, amount]);
}