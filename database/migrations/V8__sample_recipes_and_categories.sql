INSERT INTO RecipeCategories (emertimi, pershkrimi, imazhi) VALUES
('Pjatat Kryesore', 'Receta të shijshme për pjatat kryesore të drekës ose darkës', NULL),
('Supat', 'Supat tradicionale dhe moderne për të ngropur mëngjesin ose dreken', NULL),
('Ëmblësirat', 'Receta të ëmbla për të mbyllur ndonjë vakt', NULL),
('Petullat dhe Bukimet', 'Petulla, bukë dhe produkte të tjera të pjekura', NULL),
('Përgatitjet e Shpejta', 'Receta të shpejta dhe të lehta për dita të zënë', NULL);

INSERT INTO Ingredients (emertimi, njesia_matese) VALUES
('Miell i bardhë', 'kg'),
('Vaj ulliri', 'ml'),
('Domate', 'copë'),
('Qepë', 'copë'),
('Hudhra', 'copë'),
('Kripë', 'g'),
('Piper', 'g'),
('Spinaq', 'g'),
('Djath i bardhë', 'g'),
('Qumësht', 'ml'),
('Kos', 'ml'),
('Vezë', 'copë'),
('Kumpir', 'kg'),
('Mish viçi i grirë', 'kg'),
('Mish pule', 'kg'),
('Patella', 'copë'),
('Majag', 'g'),
('Sheqer', 'g'),
('Kakao', 'g'),
('Vaj bumbaci', 'ml');

INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, category_id, user_id) 
VALUES ('Byrek me Spinaq', 'Byrek tradicional me spinaq dhe djath i bardhë, recetë familjare', 30, 45, 6, 'Mesatare', 1, 1);
SET @recipe_id = LAST_INSERT_ID();

INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES
(@recipe_id, 1, 0.5, 'kg'),
(@recipe_id, 2, 150, 'ml'),
(@recipe_id, 8, 500, 'g'),
(@recipe_id, 9, 200, 'g'),
(@recipe_id, 10, 200, 'ml'),
(@recipe_id, 4, 1, 'copë'),
(@recipe_id, 5, 2, 'copë'),
(@recipe_id, 6, 10, 'g'),
(@recipe_id, 7, 5, 'g');

INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi) VALUES
(@recipe_id, 1, 'Përgatitni pjatën për pjekje me vaj'),
(@recipe_id, 2, 'Piqni spinaqin me qepë dhe hudhra për 10 minuta'),
(@recipe_id, 3, 'Përziajeni spinaqin me djathe të bardhë dhe vezën'),
(@recipe_id, 4, 'Shtroni miëllin në pjatë dhe shtoni mbushjen'),
(@recipe_id, 5, 'Mbuloni me shtresë tjetër miëlli'),
(@recipe_id, 6, 'Piqni në 180°C për 40-45 minuta derisa të kthehet i artë');

INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, category_id, user_id)
VALUES ('Tavë Kosi', 'Pjata tradicionale shqiptare me mish, patatë dhe kos', 40, 50, 8, 'Mesatare', 1, 1);
SET @recipe_id = LAST_INSERT_ID();

INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES
(@recipe_id, 14, 0.7, 'kg'),
(@recipe_id, 13, 1, 'kg'),
(@recipe_id, 11, 500, 'ml'),
(@recipe_id, 12, 3, 'copë'),
(@recipe_id, 4, 2, 'copë'),
(@recipe_id, 5, 3, 'copë'),
(@recipe_id, 2, 100, 'ml'),
(@recipe_id, 6, 15, 'g'),
(@recipe_id, 7, 10, 'g');

INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi) VALUES
(@recipe_id, 1, 'Piqni mishit në vaj me qepë dhe hudhra'),
(@recipe_id, 2, 'Një herë që ngjiz, shtoni patatë të preza'),
(@recipe_id, 3, 'Gatuajte deri sa patatët të jenë gjysëm të gatshme'),
(@recipe_id, 4, 'Përziajeni kosin me vezën dhe kripën'),
(@recipe_id, 5, 'Hidhni përzierjen e kosit mbi mish dhe patatë'),
(@recipe_id, 6, 'Piqni në 180°C për 35-40 minuta');

INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, category_id, user_id)
VALUES ('Supë Lëngore', 'Supë shumë e shëndetshme me zarzavate të ndryshme', 20, 30, 6, 'Lehte', 2, 1);
SET @recipe_id = LAST_INSERT_ID();

INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES
(@recipe_id, 3, 4, 'copë'),
(@recipe_id, 4, 2, 'copë'),
(@recipe_id, 5, 2, 'copë'),
(@recipe_id, 2, 50, 'ml'),
(@recipe_id, 6, 10, 'g'),
(@recipe_id, 7, 5, 'g');

INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi) VALUES
(@recipe_id, 1, 'Ngrohni ujin në zall'),
(@recipe_id, 2, 'Shtoni domate, qepë dhe zarzavate të tjera'),
(@recipe_id, 3, 'Gatuajte për 25-30 minuta'),
(@recipe_id, 4, 'Shtoni kripë dhe piper sipas dëshirës');

INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, category_id, user_id)
VALUES ('Fërgesë e Tiranës', 'Mish suve me domate dhe lloj në recetën tradicionale të Tiranës', 30, 60, 6, 'Mesatare', 1, 1);
SET @recipe_id = LAST_INSERT_ID();

INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES
(@recipe_id, 15, 0.8, 'kg'),
(@recipe_id, 3, 6, 'copë'),
(@recipe_id, 4, 2, 'copë'),
(@recipe_id, 5, 3, 'copë'),
(@recipe_id, 2, 100, 'ml'),
(@recipe_id, 6, 15, 'g'),
(@recipe_id, 7, 8, 'g');

INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi) VALUES
(@recipe_id, 1, 'Prerni mishit në copa dhe piqni në vaj'),
(@recipe_id, 2, 'Shtoni qepën dhe hudhrën, piqni derisa të kundrojnë'),
(@recipe_id, 3, 'Shtoni domate të grirë'),
(@recipe_id, 4, 'Zvaghjuni zjarrin dhe gatuajte për 45 minuta'),
(@recipe_id, 5, 'Shënojuni kripën dhe piperin në fund');

INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, category_id, user_id)
VALUES ('Baklava', 'Ëmblësi tradicional e përbërë me miell, miele dhe arrë', 45, 40, 12, 'Veshtire', 3, 1);
SET @recipe_id = LAST_INSERT_ID();

INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES
(@recipe_id, 1, 0.4, 'kg'),
(@recipe_id, 20, 200, 'ml'),
(@recipe_id, 12, 2, 'copë'),
(@recipe_id, 18, 150, 'g'),
(@recipe_id, 17, 20, 'g');

INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi) VALUES
(@recipe_id, 1, 'Përgatitni pjatën për pjekje me vaj'),
(@recipe_id, 2, 'Rreshton shtresa miëlli, vaji dhe arrë'),
(@recipe_id, 3, 'Rritni shtresat deri sa mbushen pjata'),
(@recipe_id, 4, 'Piqni në 160°C për 40 minuta'),
(@recipe_id, 5, 'Hidhjni miele të nxehtë menjëherë pas nxjerrjes');

INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, category_id, user_id)
VALUES ('Lakror me Kumpir', 'Lakror i shijshëm me patatë dhe djath, recetë popullore', 35, 50, 8, 'Mesatare', 1, 1);
SET @recipe_id = LAST_INSERT_ID();

INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES
(@recipe_id, 1, 0.5, 'kg'),
(@recipe_id, 13, 1, 'kg'),
(@recipe_id, 9, 150, 'g'),
(@recipe_id, 10, 200, 'ml'),
(@recipe_id, 2, 100, 'ml'),
(@recipe_id, 4, 1, 'copë'),
(@recipe_id, 6, 12, 'g');

INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi) VALUES
(@recipe_id, 1, 'Piqni patatët dhe kalojini përmes presa'),
(@recipe_id, 2, 'Përziajeni me djath dhe qepë'),
(@recipe_id, 3, 'Shtroni miëllin në pjatë'),
(@recipe_id, 4, 'Shtoni mbushjen e patatave'),
(@recipe_id, 5, 'Mbuloni me miëll dhe piqni në 180°C për 45-50 minuta'),
(@recipe_id, 6, 'Ngjajeni me vaj pasi ta nxirrni dari furi');

INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, category_id, user_id)
VALUES ('Petulla', 'Petulla të ëmbla për mëngjesin ose drekën e lehtë', 15, 20, 4, 'Lehte', 4, 1);
SET @recipe_id = LAST_INSERT_ID();

INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES
(@recipe_id, 1, 0.3, 'kg'),
(@recipe_id, 12, 2, 'copë'),
(@recipe_id, 10, 250, 'ml'),
(@recipe_id, 18, 50, 'g'),
(@recipe_id, 17, 10, 'g'),
(@recipe_id, 20, 200, 'ml');

INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi) VALUES
(@recipe_id, 1, 'Përziajeni miëllin, ujin, vezet dhe sheqerin'),
(@recipe_id, 2, 'Lënyini majagen dhe shtojeni në përzierjen'),
(@recipe_id, 3, 'Ngrohni vaj në tigel të thellë'),
(@recipe_id, 4, 'Hidhjni përzierjen me lugë dhe piqni derisa të kuqem'),
(@recipe_id, 5, 'Hidhjni në mjaltë ose sheqer të gatuar');

INSERT INTO Recipes (titulli, pershkrimi, koha_pergatitjes, koha_gatimit, porcione, veshtiresija, category_id, user_id)
VALUES ('Sallatë Turshi', 'Përgatitje e shpejta e zarzavateve në turshi, perfekte si meze', 15, 0, 4, 'Lehte', 5, 1);
SET @recipe_id = LAST_INSERT_ID();

INSERT INTO RecipeIngredients (recipe_id, ingredient_id, sasia, njesia) VALUES
(@recipe_id, 3, 3, 'copë'),
(@recipe_id, 4, 2, 'copë'),
(@recipe_id, 2, 100, 'ml'),
(@recipe_id, 6, 10, 'g'),
(@recipe_id, 7, 5, 'g');

INSERT INTO RecipeSteps (recipe_id, hapi_nr, pershkrimi) VALUES
(@recipe_id, 1, 'Preni domate dhe qepë në copa të imta'),
(@recipe_id, 2, 'Përziejini në tas me vaj, kripë dhe piper'),
(@recipe_id, 3, 'Lënojuni disa minuta në frigider'),
(@recipe_id, 4, 'Servujeni freskë si meze');

COMMIT;
