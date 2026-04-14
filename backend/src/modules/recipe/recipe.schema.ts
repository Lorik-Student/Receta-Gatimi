import { z } from "zod";

const recipeStepSchema = z.object({
  hapi_nr: z.coerce.number().int().positive(),
  pershkrimi: z.string().trim().min(1),
  imazhi: z.string().trim().url().max(1024).optional()
}).strict();

const recipeIngredientSchema = z.object({
  ingredient_id: z.coerce.number().int().positive(),
  sasia: z.coerce.number().positive(),
  njesia: z.string().trim().min(1).max(50)
}).strict();

export const createRecipeBodySchema = z.object({
  titulli: z.string().trim().min(2).max(150),
  pershkrimi: z.string().trim().min(10),
  koha_pergatitjes: z.coerce.number().int().nonnegative(),
  koha_gatimit: z.coerce.number().int().nonnegative(),
  porcione: z.coerce.number().int().positive(),
  veshtiresija: z.enum(["Easy", "Medium", "Hard"]),
  imazhi: z.string().trim().url().max(1024).optional(),
  user_id: z.coerce.number().int().positive(),
  category_id: z.coerce.number().int().positive(),
  steps: z.array(recipeStepSchema).min(1),
  ingredients: z.array(recipeIngredientSchema).min(1),
  tags: z.array(z.coerce.number().int().positive()).default([])
}).strict();
