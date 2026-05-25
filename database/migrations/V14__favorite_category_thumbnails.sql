SET @favorite_category_thumbnail_column_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'FavoriteCategories'
      AND COLUMN_NAME = 'imazhi'
);

SET @favorite_category_thumbnail_sql := IF(
    @favorite_category_thumbnail_column_exists = 0,
    'ALTER TABLE FavoriteCategories ADD COLUMN imazhi VARCHAR(255) NULL DEFAULT NULL AFTER is_public',
    'SELECT 1'
);

PREPARE favorite_category_thumbnail_stmt FROM @favorite_category_thumbnail_sql;
EXECUTE favorite_category_thumbnail_stmt;
DEALLOCATE PREPARE favorite_category_thumbnail_stmt;

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
    );