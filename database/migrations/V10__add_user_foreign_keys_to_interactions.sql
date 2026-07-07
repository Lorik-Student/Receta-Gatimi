ALTER TABLE Reviews
    MODIFY COLUMN user_id INT UNSIGNED NULL;

ALTER TABLE Reviews
    ADD CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE;

ALTER TABLE Favorites
    MODIFY COLUMN user_id INT UNSIGNED NULL;

ALTER TABLE Favorites
    ADD CONSTRAINT fk_favorites_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE;
