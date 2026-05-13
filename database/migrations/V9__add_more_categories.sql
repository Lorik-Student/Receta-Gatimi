DELETE FROM RecipeCategories
WHERE emertimi IN (
  'Mish', 'Peshk', 'Perime', 'Vezë', 'Dieta', 'Fast Food', 'Supë', 'Pasta', 'Bukë', 'Embelsira'
);

INSERT INTO RecipeCategories (emertimi, pershkrimi)
SELECT 'Brum', 'Receta me brumë dhe produkte të pjekura'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM RecipeCategories WHERE emertimi = 'Brum');

INSERT INTO RecipeCategories (emertimi, pershkrimi)
SELECT 'Mish', 'Receta me mish (pule, viç, qengj, etj.)'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM RecipeCategories WHERE emertimi = 'Mish');

INSERT INTO RecipeCategories (emertimi, pershkrimi)
SELECT 'Peshk', 'Receta me peshk dhe fruta deti'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM RecipeCategories WHERE emertimi = 'Peshk');

INSERT INTO RecipeCategories (emertimi, pershkrimi)
SELECT 'Perime', 'Receta të bazuara në perime dhe vegjetariane'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM RecipeCategories WHERE emertimi = 'Perime');

INSERT INTO RecipeCategories (emertimi, pershkrimi)
SELECT 'Pasta', 'Receta me pasta dhe makarona'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM RecipeCategories WHERE emertimi = 'Pasta');

INSERT INTO RecipeCategories (emertimi, pershkrimi)
SELECT 'Embelsira', 'Receta për ëmbëlsira dhe produkte të ëmbla'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM RecipeCategories WHERE emertimi = 'Embelsira');

INSERT INTO RecipeCategories (emertimi, pershkrimi)
SELECT 'Dietale', 'Receta të shëndetshme dhe për dieta'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM RecipeCategories WHERE emertimi = 'Dietale');

COMMIT;
