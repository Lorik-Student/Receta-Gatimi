CREATE DATABASE receta_gatimi;
USE receta_gatimi;

CREATE TABLE RecipeCategories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emertimi VARCHAR(100) NOT NULL,
    pershkrimi TEXT,
    imazhi VARCHAR(255)
);

CREATE TABLE Ingredienfavoritests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emertimi VARCHAR(100) NOT NULL,
    njesia_matese VARCHAR(20)
);

CREATE TABLE Tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emertimi VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulli VARCHAR(150) NOT NULL,
    pershkrimi TEXT,
    koha_pergatitjes INT,
    koha_gatimit INT,
    porcione INT,
    veshtiresija ENUM('Lehtë', 'Mesatare', 'Vështirë'),
    imazhi VARCHAR(255),
    user_id INT,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES RecipeCategories(id) ON DELETE SET NULL
);

CREATE TABLE RecipeSteps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT,
    hapi_nr INT NOT NULL,
    pershkrimi TEXT NOT NULL,
    imazhi VARCHAR(255),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE
);

CREATE TABLE RecipeIngredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT,
    ingredient_id INT,
    sasia DECIMAL(10,2),
    njesia VARCHAR(20),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id) ON DELETE CASCADE
);

CREATE TABLE RecipeTags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT,
    tag_id INT,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

CREATE TABLE Reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT,
    user_id INT,
    vleresimi INT CHECK (vleresimi BETWEEN 1 AND 5),
    komenti TEXT,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE
);

CREATE TABLE Favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    recipe_id INT,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE
);

CREATE TABLE ShoppingList (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    emertimi VARCHAR(100),
    data_krijimit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ShoppingListItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shopping_list_id INT,
    ingredient_id INT,
    sasia VARCHAR(50),
    eshte_blere BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (shopping_list_id) REFERENCES ShoppingList(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES Ingredients(id)
);