CREATE TABLE IF NOT EXISTS Notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    actor_user_id INT UNSIGNED NULL,
    recipe_id INT UNSIGNED NOT NULL,
    notification_type VARCHAR(20) NOT NULL,
    title VARCHAR(120) NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE
);

SET @notifications_index_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Notifications'
      AND INDEX_NAME = 'idx_notifications_user_read_data'
);

SET @notifications_index_sql := IF(
    @notifications_index_exists = 0,
    'CREATE INDEX idx_notifications_user_read_data ON Notifications (user_id, is_read, data DESC)',
    'SELECT 1'
);

PREPARE notifications_index_stmt FROM @notifications_index_sql;
EXECUTE notifications_index_stmt;
DEALLOCATE PREPARE notifications_index_stmt;