import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Category } from "../../common/types/category.types.js";

//read categories
export async function findAllCategories(): Promise<Category[]> {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM RecipeCategories");
    return rows as Category[];
}

//create category
export async function insertCategory(cat: Omit<Category, "id">): Promise<number> {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO RecipeCategories (emertimi, pershkrimi, imazhi) VALUES (?, ?, ?)",
        [cat.emertimi, cat.pershkrimi, cat.imazhi]
    );
    return res.insertId;
}

//update category
export async function updateCategory(id: number, cat: Partial<Omit<Category, "id">>): Promise<boolean> {
    const keys = Object.keys(cat) as Array<keyof typeof cat>;
    if (keys.length === 0) return false;

    const setClause = keys.map((key) => `${String(key)} = ?`).join(", ");
    const values = keys.map((key) => cat[key]);

    const [res] = await db.query<ResultSetHeader>(
        `UPDATE RecipeCategories SET ${setClause} WHERE id = ?`,
        [...values, id]
    );
    return res.affectedRows > 0;
}

//delete category
export async function deleteCategory(id: number): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "DELETE FROM RecipeCategories WHERE id = ?",
        [id]
    );
    return res.affectedRows > 0;
}
