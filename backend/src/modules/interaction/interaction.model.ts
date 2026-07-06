import db from "../../config/db.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Favorite, FavoriteCategory, FavoriteRecipeItem, Review } from "../../common/types/recipe.types.js";
import type { BugReportRecord, RecipeReportRecord, UserReportRecord } from "../../common/types/report.types.js";

let favoriteSupportPromise: Promise<void> | null = null;
let reportSupportPromise: Promise<void> | null = null;

async function hasFavoriteCategoryThumbnailColumn(): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'FavoriteCategories'
           AND COLUMN_NAME = 'imazhi'`
    );

    return rows.length > 0;
}

async function hasFavoriteCategoryDescriptionColumn(): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'FavoriteCategories'
           AND COLUMN_NAME = 'pershkrimi'`
    );

    return rows.length > 0;
}

async function backfillFavoriteCategoryThumbnails(): Promise<void> {
    await db.query(`
        UPDATE FavoriteCategories fc
        SET fc.imazhi = (
            SELECT r.imazhi
            FROM FavoriteCategoryItems fci
            INNER JOIN Favorites f ON f.id = fci.favorite_id
            INNER JOIN Recipes r ON r.id = f.recipe_id
            WHERE fci.category_id = fc.id
            ORDER BY fci.data_krijimit ASC, fci.id ASC
            LIMIT 1
        )
        WHERE (fc.imazhi IS NULL OR fc.imazhi = '')
          AND EXISTS (
              SELECT 1
              FROM FavoriteCategoryItems fci
              INNER JOIN Favorites f ON f.id = fci.favorite_id
              INNER JOIN Recipes r ON r.id = f.recipe_id
              WHERE fci.category_id = fc.id
                AND r.imazhi IS NOT NULL
                AND r.imazhi <> ''
          )
    `);
}

async function ensureFavoriteSupport(): Promise<void> {
    if (!favoriteSupportPromise) {
        favoriteSupportPromise = (async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS FavoriteCategories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT UNSIGNED NOT NULL,
                    emertimi VARCHAR(80) NOT NULL,
                    is_public BOOLEAN NOT NULL DEFAULT FALSE,
                    data_krijimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
                )
            `);

            if (!(await hasFavoriteCategoryThumbnailColumn())) {
                await db.query(`
                    ALTER TABLE FavoriteCategories
                    ADD COLUMN imazhi VARCHAR(255) NULL DEFAULT NULL AFTER is_public
                `);
            }

            if (!(await hasFavoriteCategoryDescriptionColumn())) {
                await db.query(`
                    ALTER TABLE FavoriteCategories
                    ADD COLUMN pershkrimi VARCHAR(500) NULL DEFAULT NULL AFTER emertimi
                `);
            }

            await backfillFavoriteCategoryThumbnails();

            await db.query(`
                CREATE TABLE IF NOT EXISTS FavoriteCategoryItems (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    category_id INT NOT NULL,
                    favorite_id INT NOT NULL,
                    data_krijimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES FavoriteCategories(id) ON DELETE CASCADE,
                    FOREIGN KEY (favorite_id) REFERENCES Favorites(id) ON DELETE CASCADE,
                    UNIQUE KEY unique_category_favorite (category_id, favorite_id)
                )
            `);
        })().catch((error) => {
            favoriteSupportPromise = null;
            throw error;
        });
    }

    return favoriteSupportPromise;
}

async function ensureReportSupport(): Promise<void> {
    if (!reportSupportPromise) {
        reportSupportPromise = (async () => {
            await db.query(`
                CREATE TABLE IF NOT EXISTS RecipeReports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    recipe_id INT NOT NULL,
                    reporter_user_id INT UNSIGNED NOT NULL,
                    reason VARCHAR(500) NOT NULL,
                    status ENUM('pending', 'dismissed') NOT NULL DEFAULT 'pending',
                    reviewed_by INT UNSIGNED NULL,
                    reviewed_at TIMESTAMP NULL DEFAULT NULL,
                    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
                    FOREIGN KEY (reporter_user_id) REFERENCES Users(id) ON DELETE CASCADE,
                    FOREIGN KEY (reviewed_by) REFERENCES Users(id) ON DELETE SET NULL,
                    INDEX idx_recipe_reports_recipe_status (recipe_id, status, data DESC),
                    INDEX idx_recipe_reports_status_data (status, data DESC)
                )
            `);

            await db.query(`
                CREATE TABLE IF NOT EXISTS UserReports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    reported_user_id INT UNSIGNED NOT NULL,
                    reporter_user_id INT UNSIGNED NOT NULL,
                    reason VARCHAR(500) NOT NULL,
                    status ENUM('pending', 'dismissed') NOT NULL DEFAULT 'pending',
                    reviewed_by INT UNSIGNED NULL,
                    reviewed_at TIMESTAMP NULL DEFAULT NULL,
                    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (reported_user_id) REFERENCES Users(id) ON DELETE CASCADE,
                    FOREIGN KEY (reporter_user_id) REFERENCES Users(id) ON DELETE CASCADE,
                    FOREIGN KEY (reviewed_by) REFERENCES Users(id) ON DELETE SET NULL,
                    INDEX idx_user_reports_user_status (reported_user_id, status, data DESC),
                    INDEX idx_user_reports_status_data (status, data DESC)
                )
            `);

            await db.query(`
                CREATE TABLE IF NOT EXISTS BugReports (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    reporter_user_id INT UNSIGNED NOT NULL,
                    subject VARCHAR(120) NOT NULL,
                    message VARCHAR(1000) NOT NULL,
                    status ENUM('pending', 'resolved') NOT NULL DEFAULT 'pending',
                    reviewed_by INT UNSIGNED NULL,
                    reviewed_at TIMESTAMP NULL DEFAULT NULL,
                    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (reporter_user_id) REFERENCES Users(id) ON DELETE CASCADE,
                    FOREIGN KEY (reviewed_by) REFERENCES Users(id) ON DELETE SET NULL,
                    INDEX idx_bug_reports_status_data (status, data DESC)
                )
            `);
        })().catch((error) => {
            reportSupportPromise = null;
            throw error;
        });
    }

    return reportSupportPromise;
}


export async function insertReview(review: Omit<Review, "id" | "data">): Promise<number> {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO Reviews (recipe_id, user_id, vleresimi, komenti) VALUES (?, ?, ?, ?)",
        [review.recipe_id, review.user_id, review.vleresimi, review.komenti]
    );
    return res.insertId;
}

export async function getReviewsByRecipe(recipeId: number): Promise<Review[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT r.*, u.emri AS reviewer_emri, u.mbiemri AS reviewer_mbiemri
         FROM Reviews r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.recipe_id = ?
         ORDER BY r.data DESC`,
        [recipeId]
    );
    return rows as Review[];
}

export async function getAllReviews(): Promise<Review[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT r.*, u.emri AS reviewer_emri, u.mbiemri AS reviewer_mbiemri, rec.titulli AS recipe_title
         FROM Reviews r
         LEFT JOIN users u ON u.id = r.user_id
         LEFT JOIN Recipes rec ON rec.id = r.recipe_id
         ORDER BY r.data DESC`
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

export async function updateReviewById(reviewId: number, vleresimi: number, komenti: string): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "UPDATE Reviews SET vleresimi = ?, komenti = ? WHERE id = ?",
        [vleresimi, komenti, reviewId]
    );
    return res.affectedRows > 0;
}

export async function insertBugReport(userId: number, subject: string, message: string): Promise<{ id: number; created: boolean }> {
    await ensureReportSupport();

    const [existing] = await db.query<RowDataPacket[]>(
        `SELECT id FROM BugReports WHERE reporter_user_id = ? AND subject = ? AND message = ? AND status = 'pending' ORDER BY id DESC LIMIT 1`,
        [userId, subject, message]
    );

    if (existing[0]) {
        return { id: Number(existing[0].id), created: false };
    }

    const [res] = await db.query<ResultSetHeader>(
        `INSERT INTO BugReports (reporter_user_id, subject, message, status) VALUES (?, ?, ?, 'pending')`,
        [userId, subject, message]
    );

    return { id: res.insertId, created: true };
}

export async function getPendingBugReports(): Promise<BugReportRecord[]> {
    await ensureReportSupport();

    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT br.id, br.reporter_user_id, u.emri AS reporter_emri, u.mbiemri AS reporter_mbiemri, u.email AS reporter_email,
               br.subject, br.message, br.status, br.data
          FROM BugReports br
          INNER JOIN users u ON u.id = br.reporter_user_id
         WHERE br.status = 'pending'
         ORDER BY br.data DESC
    `);

    return rows as BugReportRecord[];
}

export async function resolveBugReport(bugReportId: number, adminUserId: number): Promise<boolean> {
    await ensureReportSupport();

    const [res] = await db.query<ResultSetHeader>(`
        UPDATE BugReports
           SET status = 'resolved', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
         WHERE id = ? AND status = 'pending'
    `, [adminUserId, bugReportId]);

    return res.affectedRows > 0;
}

export async function deleteReview(reviewId: number, userId: number): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "DELETE FROM Reviews WHERE id = ? AND user_id = ?",
        [reviewId, userId]
    );
    return res.affectedRows > 0;
}

export async function deleteReviewById(reviewId: number): Promise<boolean> {
    const [res] = await db.query<ResultSetHeader>(
        "DELETE FROM Reviews WHERE id = ?",
        [reviewId]
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

export async function findFavoriteByRecipe(userId: number, recipeId: number): Promise<Favorite | null> {
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM Favorites WHERE user_id = ? AND recipe_id = ? ORDER BY id ASC LIMIT 1",
        [userId, recipeId]
    );

    return rows[0] as Favorite | undefined ?? null;
}

async function ensureFavoriteCategoryThumbnail(categoryId: number): Promise<void> {
    const [categoryRows] = await db.query<RowDataPacket[]>(
        "SELECT imazhi FROM FavoriteCategories WHERE id = ? LIMIT 1",
        [categoryId]
    );

    const currentThumbnail = typeof categoryRows[0]?.imazhi === "string" ? categoryRows[0].imazhi.trim() : "";
    if (currentThumbnail) {
        return;
    }

    const [thumbnailRows] = await db.query<RowDataPacket[]>(
        `SELECT r.imazhi
         FROM FavoriteCategoryItems fci
         INNER JOIN Favorites f ON f.id = fci.favorite_id
         INNER JOIN Recipes r ON r.id = f.recipe_id
         WHERE fci.category_id = ?
         ORDER BY fci.data_krijimit ASC, fci.id ASC
         LIMIT 1`,
        [categoryId]
    );

    const thumbnail = typeof thumbnailRows[0]?.imazhi === "string" ? thumbnailRows[0].imazhi.trim() : "";
    if (!thumbnail) {
        return;
    }

    await db.query(
        "UPDATE FavoriteCategories SET imazhi = ? WHERE id = ? AND (imazhi IS NULL OR imazhi = '')",
        [thumbnail, categoryId]
    );
}

export async function findFavoriteCategoryById(categoryId: number): Promise<FavoriteCategory | null> {
    await ensureFavoriteSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM FavoriteCategories WHERE id = ? LIMIT 1",
        [categoryId]
    );

    return rows[0] as FavoriteCategory | undefined ?? null;
}

export async function findFavoriteCategoryByIdAndOwner(categoryId: number, userId: number): Promise<FavoriteCategory | null> {
    await ensureFavoriteSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM FavoriteCategories WHERE id = ? AND user_id = ? LIMIT 1",
        [categoryId, userId]
    );

    return rows[0] as FavoriteCategory | undefined ?? null;
}

export async function insertFavoriteInCategory(categoryId: number, favoriteId: number): Promise<number> {
    const [res] = await db.query<ResultSetHeader>(
        "INSERT IGNORE INTO FavoriteCategoryItems (category_id, favorite_id) VALUES (?, ?)",
        [categoryId, favoriteId]
    );

    await ensureFavoriteCategoryThumbnail(categoryId);

    return res.insertId;
}

export async function insertFavoriteCategory(userId: number, emertimi: string, isPublic: boolean): Promise<number> {
    await ensureFavoriteSupport();
    const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO FavoriteCategories (user_id, emertimi, is_public) VALUES (?, ?, ?)",
        [userId, emertimi, isPublic]
    );

    return res.insertId;
}

export async function updateFavoriteCategory(userId: number, categoryId: number, data: { emertimi?: string; pershkrimi?: string | null; is_public?: boolean }): Promise<boolean> {
    await ensureFavoriteSupport();
    const updates: string[] = [];
    const values: Array<string | number | boolean | null> = [];

    if (data.emertimi !== undefined) {
        updates.push("emertimi = ?");
        values.push(data.emertimi);
    }

    if (data.pershkrimi !== undefined) {
        updates.push("pershkrimi = ?");
        values.push(data.pershkrimi);
    }

    if (data.is_public !== undefined) {
        updates.push("is_public = ?");
        values.push(data.is_public);
    }

    if (!updates.length) {
        return false;
    }

    const [res] = await db.query<ResultSetHeader>(
        `UPDATE FavoriteCategories SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
        [...values, categoryId, userId]
    );

    return res.affectedRows > 0;
}

export async function deleteFavoriteCategory(userId: number, categoryId: number): Promise<boolean> {
    await ensureFavoriteSupport();
    const [res] = await db.query<ResultSetHeader>(
        "DELETE FROM FavoriteCategories WHERE id = ? AND user_id = ?",
        [categoryId, userId]
    );

    return res.affectedRows > 0;
}

export async function getFavoriteCategoriesByUser(userId: number): Promise<FavoriteCategory[]> {
    await ensureFavoriteSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM FavoriteCategories WHERE user_id = ? ORDER BY data_krijimit DESC",
        [userId]
    );

    return rows as FavoriteCategory[];
}

export async function getFavoriteCategoriesByUserPublic(userId: number): Promise<FavoriteCategory[]> {
    await ensureFavoriteSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM FavoriteCategories WHERE user_id = ? AND is_public = TRUE ORDER BY data_krijimit DESC",
        [userId]
    );

    return rows as FavoriteCategory[];
}

export async function getCategorizedFavoritesForOwner(userId: number): Promise<RowDataPacket[]> {
    await ensureFavoriteSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT fc.id AS category_id,
                fc.user_id,
                fc.emertimi AS category_name,
                fc.is_public,
                fc.imazhi,
                fc.data_krijimit,
                f.id AS favorite_id,
                f.recipe_id,
                f.data,
                r.titulli,
                r.imazhi
         FROM FavoriteCategories fc
         LEFT JOIN FavoriteCategoryItems fci ON fci.category_id = fc.id
         LEFT JOIN Favorites f ON f.id = fci.favorite_id
         LEFT JOIN Recipes r ON r.id = f.recipe_id
         WHERE fc.user_id = ?
         ORDER BY fc.data_krijimit DESC, f.data DESC`,
        [userId]
    );

    return rows;
}

export async function getCategorizedPublicFavoritesByUser(userId: number): Promise<RowDataPacket[]> {
    await ensureFavoriteSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT fc.id AS category_id,
                fc.user_id,
                fc.emertimi AS category_name,
                fc.is_public,
                fc.imazhi,
                fc.data_krijimit,
                f.id AS favorite_id,
                f.recipe_id,
                f.data,
                r.titulli,
                r.imazhi
         FROM FavoriteCategories fc
         LEFT JOIN FavoriteCategoryItems fci ON fci.category_id = fc.id
         LEFT JOIN Favorites f ON f.id = fci.favorite_id
         LEFT JOIN Recipes r ON r.id = f.recipe_id
         WHERE fc.user_id = ? AND fc.is_public = TRUE
         ORDER BY fc.data_krijimit DESC, f.data DESC`,
        [userId]
    );

    return rows;
}

export async function getUncategorizedFavoritesByUser(userId: number): Promise<FavoriteRecipeItem[]> {
    await ensureFavoriteSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT f.id AS favorite_id,
                f.recipe_id,
                f.data,
                r.titulli,
                r.imazhi
         FROM Favorites f
         JOIN Recipes r ON r.id = f.recipe_id
         LEFT JOIN FavoriteCategoryItems fci ON fci.favorite_id = f.id
         WHERE f.user_id = ? AND fci.id IS NULL
         ORDER BY f.data DESC`,
        [userId]
    );

    return rows as FavoriteRecipeItem[];
}

export async function getFavoritesByUser(userId: number): Promise<RowDataPacket[]> {
    await ensureFavoriteSupport();
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

export async function insertRecipeReport(userId: number, recipeId: number, reason: string): Promise<{ id: number; created: boolean; hidden: boolean }> {
    await ensureReportSupport();
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [existingRows] = await conn.query<RowDataPacket[]>(
            `SELECT id
             FROM RecipeReports
             WHERE reporter_user_id = ? AND recipe_id = ? AND status = 'pending'
             ORDER BY id ASC
             LIMIT 1`,
            [userId, recipeId]
        );

        const existingId = existingRows[0]?.id ? Number(existingRows[0].id) : null;
        if (existingId) {
            await conn.commit();
            return { id: existingId, created: false, hidden: false };
        }

        const [result] = await conn.query<ResultSetHeader>(
            `INSERT INTO RecipeReports (recipe_id, reporter_user_id, reason, status)
             VALUES (?, ?, ?, 'pending')`,
            [recipeId, userId, reason]
        );

        const [countRows] = await conn.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS report_count
             FROM RecipeReports
             WHERE recipe_id = ? AND status = 'pending'`,
            [recipeId]
        );

        const pendingCount = Number(countRows[0]?.report_count ?? 0);
        let hidden = false;

        if (pendingCount > 5) {
            await conn.query<ResultSetHeader>(
                `UPDATE Recipes
                 SET is_hidden = TRUE,
                     hidden_at = COALESCE(hidden_at, CURRENT_TIMESTAMP),
                     hidden_reason = 'Reported by users'
                 WHERE id = ?`,
                [recipeId]
            );
            hidden = true;
        }

        await conn.commit();
        return { id: result.insertId, created: true, hidden };
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

export async function insertUserReport(userId: number, reportedUserId: number, reason: string): Promise<{ id: number; created: boolean }> {
    await ensureReportSupport();
    const [existingRows] = await db.query<RowDataPacket[]>(
        `SELECT id
         FROM UserReports
         WHERE reporter_user_id = ? AND reported_user_id = ? AND status = 'pending'
         ORDER BY id ASC
         LIMIT 1`,
        [userId, reportedUserId]
    );

    const existingId = existingRows[0]?.id ? Number(existingRows[0].id) : null;
    if (existingId) {
        return { id: existingId, created: false };
    }

    const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO UserReports (reported_user_id, reporter_user_id, reason, status)
         VALUES (?, ?, ?, 'pending')`,
        [reportedUserId, userId, reason]
    );

    return { id: result.insertId, created: true };
}

export async function getPendingRecipeReports(): Promise<RecipeReportRecord[]> {
    await ensureReportSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT rr.id,
                rr.recipe_id,
                r.titulli AS recipe_title,
                r.imazhi AS recipe_image,
                COALESCE(r.is_hidden, FALSE) AS recipe_hidden,
                r.hidden_at AS recipe_hidden_at,
                r.hidden_reason AS recipe_hidden_reason,
                rr.reporter_user_id,
                reporter.emri AS reporter_emri,
                reporter.mbiemri AS reporter_mbiemri,
                rr.reason,
                rr.data
         FROM RecipeReports rr
         INNER JOIN Recipes r ON r.id = rr.recipe_id
         INNER JOIN users reporter ON reporter.id = rr.reporter_user_id
         WHERE rr.status = 'pending'
         ORDER BY rr.data DESC, rr.id DESC`
    );

    return rows as RecipeReportRecord[];
}

export async function getPendingUserReports(): Promise<UserReportRecord[]> {
    await ensureReportSupport();
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT ur.id,
                ur.reported_user_id,
                reported.emri AS reported_emri,
                reported.mbiemri AS reported_mbiemri,
                reported.email AS reported_email,
                ur.reporter_user_id,
                reporter.emri AS reporter_emri,
                reporter.mbiemri AS reporter_mbiemri,
                ur.reason,
                ur.data
         FROM UserReports ur
         INNER JOIN users reported ON reported.id = ur.reported_user_id
         INNER JOIN users reporter ON reporter.id = ur.reporter_user_id
         WHERE ur.status = 'pending'
         ORDER BY ur.data DESC, ur.id DESC`
    );

    return rows as UserReportRecord[];
}

export async function dismissRecipeReports(recipeId: number, adminUserId: number): Promise<boolean> {
    await ensureReportSupport();
    const [result] = await db.query<ResultSetHeader>(
        `UPDATE RecipeReports
         SET status = 'dismissed',
             reviewed_by = ?,
             reviewed_at = CURRENT_TIMESTAMP
         WHERE recipe_id = ? AND status = 'pending'`,
        [adminUserId, recipeId]
    );

    return result.affectedRows > 0;
}

export async function dismissUserReports(userId: number, adminUserId: number): Promise<boolean> {
    await ensureReportSupport();
    const [result] = await db.query<ResultSetHeader>(
        `UPDATE UserReports
         SET status = 'dismissed',
             reviewed_by = ?,
             reviewed_at = CURRENT_TIMESTAMP
         WHERE reported_user_id = ? AND status = 'pending'`,
        [adminUserId, userId]
    );

    return result.affectedRows > 0;
}
