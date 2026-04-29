import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Review, Favorite } from "../../common/types/recipe.types.js";


export async function insertReview(review: Omit<Review, "id" | "data">): Promise<number> {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO Reviews (recipe_id, user_id, vleresimi, komenti) VALUES (?, ?, ?, ?)",
        [review.recipe_id, review.user_id, review.vleresimi, review.komenti]
    );
    return res.insertId;
}

export async function getReviewsByRecipe(recipeId: number): Promise<Review[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM Reviews WHERE recipe_id = ? ORDER BY data DESC",
        [recipeId]
    );
    return rows as Review[];
}

export async function updateReview(reviewId: number, userId: number, vleresimi: number, komenti: string): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "UPDATE Reviews SET vleresimi = ?, komenti = ? WHERE id = ? AND user_id = ?",
        [vleresimi, komenti, reviewId, userId]
    );
    return res.affectedRows > 0;
}

export async function deleteReview(reviewId: number, userId: number): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "DELETE FROM Reviews WHERE id = ? AND user_id = ?",
        [reviewId, userId]
    );
    return res.affectedRows > 0;
}


export async function insertFavorite(userId: number, recipeId: number): Promise<number> {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO Favorites (user_id, recipe_id) VALUES (?, ?)",
        [userId, recipeId]
    );
    return res.insertId;
}

export async function getFavoritesByUser(userId: number): Promise<RowDataPacket[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT f.*, r.titulli, r.imazhi 
         FROM Favorites f 
         JOIN Recipes r ON f.recipe_id = r.id 
         WHERE f.user_id = ? 
         ORDER BY f.data DESC`,
        [userId]
    );
    return rows;
}

export async function removeFavorite(userId: number, recipeId: number): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "DELETE FROM Favorites WHERE user_id = ? AND recipe_id = ?",
        [userId, recipeId]
    );
    return res.affectedRows > 0;
}
