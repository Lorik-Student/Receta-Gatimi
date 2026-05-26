CREATE TABLE Notifications (
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

CREATE INDEX idx_notifications_user_read_data ON Notifications (user_id, is_read, data DESC);