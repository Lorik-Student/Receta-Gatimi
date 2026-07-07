UPDATE Recipes
SET category_id = (
    SELECT id
    FROM RecipeCategories
    WHERE emertimi = 'Pjatat Kryesore'
    ORDER BY id
    LIMIT 1
)
WHERE category_id IS NULL
  AND titulli IN ('Byrek me Spinaq', 'Tavë Kosi', 'Fërgesë e Tiranës', 'Lakror me Kumpir');

UPDATE Recipes
SET category_id = (
    SELECT id
    FROM RecipeCategories
    WHERE emertimi = 'Supat'
    ORDER BY id
    LIMIT 1
)
WHERE category_id IS NULL
  AND titulli = 'Supë Lëngore';

UPDATE Recipes
SET category_id = (
    SELECT id
    FROM RecipeCategories
    WHERE emertimi = 'Ëmblësirat'
    ORDER BY id
    LIMIT 1
)
WHERE category_id IS NULL
  AND titulli = 'Baklava';

UPDATE Recipes
SET category_id = (
    SELECT id
    FROM RecipeCategories
    WHERE emertimi = 'Petullat dhe Bukimet'
    ORDER BY id
    LIMIT 1
)
WHERE category_id IS NULL
  AND titulli = 'Petulla';

UPDATE Recipes
SET category_id = (
    SELECT id
    FROM RecipeCategories
    WHERE emertimi = 'Përgatitjet e Shpejta'
    ORDER BY id
    LIMIT 1
)
WHERE category_id IS NULL
  AND titulli = 'Sallatë Turshi';
