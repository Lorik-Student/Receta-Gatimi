import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Id } from "../../common/types/index.js";

export async function insertFullRecipe(recipeData: any, steps: any[], ingredients: any[], tags: number[]) {
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
            const ingValues = ingredients.map(i => [recipeId, i.ingredient_id, i.sasia, i.njesia]);
            await conn.query(`INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES ?`, [ingValues]);
        }
        if (tags.length) {
            const tagValues = tags.map(tagId => [recipeId, tagId]);
            await conn.query(`INSERT INTO RecipeTags (recipe_id, tag_id) VALUES ?`, [tagValues]);
        }
        await conn.commit();
        return recipeId as Id;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function getPopularRecipes(limit: number = 5) {
    const [rows] = await db.query(`
        SELECT r.id, r.titulli, COUNT(f.id) as fav_count 
        FROM Recipes r 
        LEFT JOIN Favorites f ON r.id = f.recipe_id 
        GROUP BY r.id ORDER BY fav_count DESC LIMIT ?`, [limit]);

    return rows;
}