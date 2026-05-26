ALTER TABLE Recipes
    ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN hidden_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN hidden_reason VARCHAR(255) NULL;

CREATE TABLE RecipeReports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT UNSIGNED NOT NULL,
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
);

CREATE TABLE UserReports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
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
);