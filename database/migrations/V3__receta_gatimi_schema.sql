CREATE TABLE RecipeCategories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    emertimi VARCHAR(100) NOT NULL,
    pershkrimi TEXT,
    imazhi VARCHAR(255)
);

CREATE TABLE Ingredients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    emertimi VARCHAR(100) NOT NULL,
    njesia_matese VARCHAR(20)
);

CREATE TABLE Tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    emertimi VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Recipes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulli VARCHAR(150) NOT NULL,
    pershkrimi TEXT,
    koha_pergatitjes INT,
    koha_gatimit INT,
    porcione INT,
    veshtiresija ENUM('Lehte', 'Mesatare', 'Veshtire'),
    imazhi VARCHAR(255),
    user_id INT UNSIGNED,
    category_id INT UNSIGNED,
    FOREIGN KEY (category_id) REFERENCES RecipeCategories(id) ON DELETE SET NULL
);

CREATE TABLE RecipeSteps (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT UNSIGNED,
    hapi_nr INT NOT NULL,
    pershkrimi TEXT NOT NULL,
    imazhi VARCHAR(255),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE
);

CREATE TABLE RecipeIngredients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT UNSIGNED,
    ingredient_id INT UNSIGNED,
    sasia DECIMAL(10,2),
    njesia VARCHAR(20),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id) ON DELETE CASCADE
);

CREATE TABLE RecipeTags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT UNSIGNED,
    tag_id INT UNSIGNED,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

CREATE TABLE Reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT UNSIGNED,
    user_id INT UNSIGNED,
    vleresimi INT CHECK (vleresimi BETWEEN 1 AND 5),
    komenti TEXT,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE
);

CREATE TABLE Favorites (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    recipe_id INT UNSIGNED,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE
);

CREATE TABLE ShoppingList (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    emertimi VARCHAR(100),
    data_krijimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ShoppingListItems (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shopping_list_id INT UNSIGNED,
    ingredient_id INT UNSIGNED,
    sasia VARCHAR(50),
    eshte_blere BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (shopping_list_id) REFERENCES ShoppingList(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id)
);