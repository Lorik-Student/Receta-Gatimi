import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
let recipeVisibilityColumnsPromise: Promise<boolean> | null = null;

async function hasRecipeVisibilityColumns(): Promise<boolean> {
    if (!recipeVisibilityColumnsPromise) {
        recipeVisibilityColumnsPromise = db
            .query<RowDataPacket[]>(
                `SELECT COLUMN_NAME
                 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE()
                   AND TABLE_NAME = 'Recipes'
                   AND COLUMN_NAME IN ('is_hidden', 'hidden_at', 'hidden_reason')`
            )
            .then(([rows]) => rows.length >= 3)
            .catch(() => false);
    }

    return recipeVisibilityColumnsPromise;
}

const RECIPE_SELECT_WITH_AUTHOR = `
    SELECT r.*, u.id AS author_id, u.emri AS author_emri, u.mbiemri AS author_mbiemri
    FROM Recipes r
    LEFT JOIN users u ON u.id = r.user_id
`;
//create recipe
export async function insertFullRecipe(recipeData: any, steps: any[], ingredients: any[], tags: string[]) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [res] = await conn.query<ResultSetHeader>(
            `INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, imazhi, user_id, category_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [recipeData.titulli, recipeData.pershkrimi, recipeData.koha_pergatitjes, recipeData.koha_gatimit, recipeData.porcione, recipeData.veshtiresija, recipeData.imazhi, recipeData.user_id, recipeData.category_id]
        );
        const recipeId = res.insertId;

        if (steps.length) {
            const stepValues = steps.map(s => [recipeId, s.hapi_nr, s.pershkrimi, s.imazhi]);
            await conn.query(`INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi, imazhi) VALUES ?`, [stepValues]);
        }
        if (ingredients.length) {
            const ingValues = [];
            for (const i of ingredients) {
                let ingredientId;
                const [existing] = await conn.query<RowDataPacket[]>("SELECT id FROM Ingredients WHERE emertimi = ?", [i.emertimi]);
                if (existing.length > 0) {
                    ingredientId = existing[0]!.id;
                } else {
                    const [newIng] = await conn.query<ResultSetHeader>("INSERT INTO Ingredients (emertimi) VALUES (?)", [i.emertimi]);
                    ingredientId = newIng.insertId;
                }
                ingValues.push([recipeId, ingredientId, i.sasia, i.njesia]);
            }
            if (ingValues.length > 0) {
                await conn.query(`INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES ?`, [ingValues]);
            }
        }
        if (tags.length) {
            const tagValues = [];
            for (const tagName of tags) {
                let tagId;
                const [existing] = await conn.query<RowDataPacket[]>("SELECT id FROM Tags WHERE emertimi = ?", [tagName]);
                if (existing.length > 0) {
                    tagId = existing[0]!.id;
                } else {
                    const [newTag] = await conn.query<ResultSetHeader>("INSERT INTO Tags (emertimi) VALUES (?)", [tagName]);
                    tagId = newTag.insertId;
                }
                tagValues.push([recipeId, tagId]);
            }
            if (tagValues.length > 0) {
                await conn.query(`INSERT INTO RecipeTags (recipe_id, tag_id) VALUES ?`, [tagValues]);
            }
        }
        await conn.commit();
        return recipeId;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}


//read
export async function getAllRecipes() {
    const supportsVisibility = await hasRecipeVisibilityColumns();
    const [rows] = supportsVisibility
        ? await db.query(`${RECIPE_SELECT_WITH_AUTHOR} WHERE COALESCE(r.is_hidden, FALSE) = FALSE ORDER BY r.id DESC`)
        : await db.query(`${RECIPE_SELECT_WITH_AUTHOR} ORDER BY r.id DESC`);
    return rows as RowDataPacket[];
}

export async function getRecipesByUserId(userId: number, includeHidden = false) {
    const supportsVisibility = await hasRecipeVisibilityColumns();
    const [rows] = supportsVisibility && !includeHidden
        ? await db.query<RowDataPacket[]>(
            `${RECIPE_SELECT_WITH_AUTHOR} WHERE r.user_id = ? AND COALESCE(r.is_hidden, FALSE) = FALSE ORDER BY r.id DESC`,
            [userId]
        )
        : await db.query<RowDataPacket[]>(
            `${RECIPE_SELECT_WITH_AUTHOR} WHERE r.user_id = ? ORDER BY r.id DESC`,
            [userId]
        );
    return rows;
}

export async function getAllRecipesForAdmin() {
    const [rows] = await db.query(`${RECIPE_SELECT_WITH_AUTHOR} ORDER BY r.id DESC`);
    return rows as RowDataPacket[];
}

export async function getRecipeById(id: number) {
    const supportsVisibility = await hasRecipeVisibilityColumns();
    const [rows] = supportsVisibility
        ? await db.query<RowDataPacket[]>(`${RECIPE_SELECT_WITH_AUTHOR} WHERE r.id = ? AND COALESCE(r.is_hidden, FALSE) = FALSE LIMIT 1`, [id])
        : await db.query<RowDataPacket[]>(`${RECIPE_SELECT_WITH_AUTHOR} WHERE r.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
}

export async function getRecipeByIdForAdmin(id: number) {
    const [rows] = await db.query<RowDataPacket[]>(`${RECIPE_SELECT_WITH_AUTHOR} WHERE r.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
}

export async function getRecipeSteps(recipeId: number) {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM RecipeSteps WHERE recipe_id = ? ORDER BY hapi_nr ASC", [recipeId]);
    return rows;
}

export async function getRecipeIngredients(recipeId: number) {
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT ri.*, i.emertimi 
        FROM RecipeIngredients ri
        JOIN Ingredients i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = ?
    `, [recipeId]);
    return rows;
}

export async function getRecipeTags(recipeId: number) {
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT rt.*, t.emertimi 
        FROM RecipeTags rt
        JOIN Tags t ON rt.tag_id = t.id
        WHERE rt.recipe_id = ?
    `, [recipeId]);
    return rows;
}


export async function getAllIngredients() {
    const [rows] = await db.query("SELECT * FROM Ingredients");
    return rows as RowDataPacket[];
}

export async function getAllTags() {
    const [rows] = await db.query("SELECT * FROM Tags");
    return rows as RowDataPacket[];
}

//delete
export async function deleteRecipe(id: number) {
    await db.query("DELETE FROM Recipes WHERE id = ?", [id]);
}

export async function updateRecipe(id: number, recipeData: Partial<Record<string, unknown>>) {
    const keys = Object.keys(recipeData).filter((key) => recipeData[key] !== undefined);
    if (!keys.length) {
        return false;
    }

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const values = keys.map((key) => recipeData[key]);

    const [result] = await db.query<ResultSetHeader>(
        `UPDATE Recipes SET ${setClause} WHERE id = ?`,
        [...values, id]
    );

    return result.affectedRows > 0;
}


//create ingredient
export async function insertIngredient(emertimi: string, njesia: string) {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO Ingredients (emertimi, njesia_matese) VALUES (?, ?)",
        [emertimi, njesia]
    );
    return res.insertId;
}

//create tag
export async function insertTag(emertimi: string) {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO Tags (emertimi) VALUES (?)",
        [emertimi]
    );
    return res.insertId;
}

export async function deleteTag(tag_id: number) {
    const [res] = await db.query<ResultSetHeader>("DELETE FROM Tags WHERE id = ?", [tag_id]);
    return res.affectedRows > 0;
}

export async function deleteIngredient(ingredient_id: number) {
    const [res] = await db.query<ResultSetHeader>("DELETE FROM Ingredients WHERE id = ?", [ingredient_id]);
    return res.affectedRows > 0;
}



export async function getPopularRecipes() {
    const supportsVisibility = await hasRecipeVisibilityColumns();
    const [rows] = supportsVisibility
        ? await db.query(`
            SELECT r.id, r.titulli, COUNT(f.id) as fav_count 
            FROM Recipes r 
            LEFT JOIN Favorites f ON r.id = f.recipe_id 
            WHERE COALESCE(r.is_hidden, FALSE) = FALSE
            GROUP BY r.id ORDER BY fav_count DESC LIMIT ?`, [5])
        : await db.query(`
            SELECT r.id, r.titulli, COUNT(f.id) as fav_count 
            FROM Recipes r 
            LEFT JOIN Favorites f ON r.id = f.recipe_id 
            GROUP BY r.id ORDER BY fav_count DESC LIMIT ?`, [5]);

    return rows;
}

export async function restoreRecipeVisibility(id: number): Promise<boolean> {
    if (!(await hasRecipeVisibilityColumns())) {
        return false;
    }

    const [result] = await db.query<ResultSetHeader>(
        `UPDATE Recipes
         SET is_hidden = FALSE,
             hidden_at = NULL,
             hidden_reason = NULL
         WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
}