import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { ListItem, ShoppingList, ShoppingListItemDetails, ShoppingListWithItems } from "../../common/types/index.js";

const DEFAULT_SHOPPING_LIST_TITLE = "Lista e blerjeve";

function normalizeAmount(value: string | number): string {
    const numericValue = typeof value === "number" ? value : Number(value);

    if (!Number.isFinite(numericValue)) {
        return String(value).trim();
    }

    const roundedValue = Number.parseFloat(numericValue.toFixed(2));
    return Number.isInteger(roundedValue) ? String(Math.trunc(roundedValue)) : String(roundedValue);
}

function splitAmount(value: string): { quantity: number | null; unit: string } {
    const trimmedValue = value.trim();
    const match = trimmedValue.match(/^([0-9]+(?:\.[0-9]+)?)\s*(.*)$/);

    if (!match) {
        return { quantity: null, unit: trimmedValue };
    }

    return {
        quantity: Number(match[1]),
        unit: match[2].trim(),
    };
}

function formatAmount(quantity: number, unit?: string | null): string {
    const normalizedQuantity = normalizeAmount(quantity);
    const normalizedUnit = unit?.trim();
    return normalizedUnit ? `${normalizedQuantity} ${normalizedUnit}`.trim() : normalizedQuantity;
}

function addAmounts(currentAmount: string, incomingAmount: string): string {
    const currentParts = splitAmount(currentAmount);
    const incomingParts = splitAmount(incomingAmount);

    if (currentParts.quantity !== null && incomingParts.quantity !== null) {
        if (!currentParts.unit || !incomingParts.unit || currentParts.unit === incomingParts.unit) {
            return formatAmount(currentParts.quantity + incomingParts.quantity, currentParts.unit || incomingParts.unit);
        }
    }

    return incomingAmount;
}

// -- LISTS --

export async function insertList(user_id: number, title: string): Promise<number> {
    const [res] = await db.query<ResultSetHeader>("INSERT INTO ShoppingList (user_id, emertimi) VALUES (?, ?)", [user_id, title]);
    return res.insertId;
}

export async function getListsByUser(user_id: number): Promise<ShoppingList[]> {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM ShoppingList WHERE user_id = ? ORDER BY data_krijimit DESC", [user_id]);
    return rows as ShoppingList[];
}

export async function getDefaultListByUser(user_id: number): Promise<ShoppingList | null> {
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM ShoppingList WHERE user_id = ? AND emertimi = ? ORDER BY data_krijimit ASC LIMIT 1",
        [user_id, DEFAULT_SHOPPING_LIST_TITLE]
    );

    return (rows[0] as ShoppingList | undefined) ?? null;
}

export async function getOrCreateDefaultList(user_id: number): Promise<ShoppingList> {
    const existingList = await getDefaultListByUser(user_id);
    if (existingList) {
        return existingList;
    }

    const listId = await insertList(user_id, DEFAULT_SHOPPING_LIST_TITLE);
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM ShoppingList WHERE id = ? LIMIT 1", [listId]);
    const createdList = rows[0] as ShoppingList | undefined;

    if (!createdList) {
        throw new Error("Failed to create default shopping list");
    }

    return createdList;
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
        [list_id, ingredient_id, normalizeAmount(amount)]
    );
    return res.insertId;
}

export async function findListItemByIngredient(list_id: number, ingredient_id: number): Promise<ListItem | null> {
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM ShoppingListItems WHERE shopping_list_id = ? AND ingredient_id = ? LIMIT 1",
        [list_id, ingredient_id]
    );

    return (rows[0] as ListItem | undefined) ?? null;
}

export async function getListItemsWithIngredients(list_id: number): Promise<ShoppingListItemDetails[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT sli.id,
                sli.shopping_list_id,
                sli.ingredient_id,
                sli.sasia,
                sli.eshte_blere,
                i.emertimi AS ingredient_emertimi,
                i.njesia_matese AS ingredient_njesia_matese
         FROM ShoppingListItems sli
         INNER JOIN Ingredients i ON i.id = sli.ingredient_id
         WHERE sli.shopping_list_id = ?
         ORDER BY sli.eshte_blere ASC, i.emertimi ASC, sli.id ASC`,
        [list_id]
    );

    return rows as ShoppingListItemDetails[];
}

export async function getDefaultListWithItems(user_id: number): Promise<ShoppingListWithItems> {
    const list = await getOrCreateDefaultList(user_id);
    const items = await getListItemsWithIngredients(list.id);

    return { ...list, items };
}

export async function getRecipeIngredientsForShopping(recipe_id: number): Promise<RowDataPacket[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT ri.ingredient_id,
                ri.sasia,
                ri.njesia,
                i.emertimi AS ingredient_emertimi,
                i.njesia_matese AS ingredient_njesia_matese
         FROM RecipeIngredients ri
         INNER JOIN Ingredients i ON i.id = ri.ingredient_id
         WHERE ri.recipe_id = ?
         ORDER BY ri.id ASC`,
        [recipe_id]
    );

    return rows;
}

export async function addIngredientsToDefaultList(user_id: number, recipe_id: number, ingredientIds?: number[]): Promise<ShoppingListWithItems> {
    const list = await getOrCreateDefaultList(user_id);
    const recipeIngredients = await getRecipeIngredientsForShopping(recipe_id);
    const selectedIngredients = ingredientIds?.length
        ? recipeIngredients.filter((item) => ingredientIds.includes(Number(item.ingredient_id)))
        : recipeIngredients;

    if (!selectedIngredients.length) {
        return getDefaultListWithItems(user_id);
    }

    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        for (const ingredient of selectedIngredients) {
            const [existingRows] = await conn.query<RowDataPacket[]>(
                "SELECT * FROM ShoppingListItems WHERE shopping_list_id = ? AND ingredient_id = ? LIMIT 1",
                [list.id, Number(ingredient.ingredient_id)]
            );
            const existingItem = existingRows[0] as ListItem | undefined;
            const incomingAmount = formatAmount(Number(ingredient.sasia ?? 1), (ingredient.njesia || ingredient.ingredient_njesia_matese) ?? null);

            if (!existingItem) {
                await conn.query<ResultSetHeader>(
                    "INSERT INTO ShoppingListItems (shopping_list_id, ingredient_id, sasia, eshte_blere) VALUES (?, ?, ?, FALSE)",
                    [list.id, Number(ingredient.ingredient_id), incomingAmount]
                );
                continue;
            }

            const mergedAmount = addAmounts(existingItem.sasia, incomingAmount);
            await conn.query<ResultSetHeader>(
                "UPDATE ShoppingListItems SET sasia = ?, eshte_blere = FALSE WHERE id = ? AND shopping_list_id = ?",
                [mergedAmount, existingItem.id, list.id]
            );
        }

        await conn.commit();
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }

    return getDefaultListWithItems(user_id);
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
        [normalizeAmount(amount), is_bought, item_id, list_id]
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