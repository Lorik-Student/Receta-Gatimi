import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Id, Category } from "../../common/types/index.js";

export async function findAllCategories(): Promise<Category[]> {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM RecipeCategories");
    return rows as Category[];
}

export async function insertCategory(cat: Omit<Category, "id">): Promise<Id> {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO RecipeCategories (emertimi, pershkrimi, imazhi) VALUES (?, ?, ?)",
        [cat.emertimi, cat.pershkrimi, cat.imazhi]
    );
    return res.insertId as Id;
}