CREATE TABLE FavoriteCategories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    emertimi VARCHAR(80) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    data_krijimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE FavoriteCategoryItems (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id INT UNSIGNED NOT NULL,
    favorite_id INT UNSIGNED NOT NULL,
    data_krijimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES FavoriteCategories(id) ON DELETE CASCADE,
    FOREIGN KEY (favorite_id) REFERENCES Favorites(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_favorite (category_id, favorite_id)
);
