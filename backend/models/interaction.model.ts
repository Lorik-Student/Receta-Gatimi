import db from "../config/db.js";

export async function addReview(recipe_id: number, user_id: number, rating: number, comment: string) {
    await db.query("INSERT INTO Reviews (recipe_id, user_id, vleresimi, komenti) VALUES (?, ?, ?, ?)", [recipe_id, user_id, rating, comment]);
}

export async function toggleFavorite(user_id: number, recipe_id: number) {
    const [rows]: any = await db.query("SELECT id FROM Favorites WHERE user_id = ? AND recipe_id = ?", [user_id, recipe_id]);
    if (rows.length) {
        await db.query("DELETE FROM Favorites WHERE user_id = ? AND recipe_id = ?", [user_id, recipe_id]);
        return "Removed";
    }
    await db.query("INSERT INTO Favorites (user_id, recipe_id) VALUES (?, ?)", [user_id, recipe_id]);
    return "Added";
}