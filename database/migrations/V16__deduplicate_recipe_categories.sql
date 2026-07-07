DELETE rc1
FROM RecipeCategories rc1
INNER JOIN RecipeCategories rc2
    ON rc1.emertimi = rc2.emertimi
   AND rc1.id > rc2.id;

COMMIT;