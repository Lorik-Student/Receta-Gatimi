import { z } from "zod";

function isImageSource(value: string) {
  if (/^https?:\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value)) {
    return true;
  }

  return value.startsWith("/") || value.startsWith("uploads/") || value.startsWith("uploads\\");
}

const recipeImageSchema = z.string().trim().max(1024).refine(isImageSource, {
  message: "Imazhi duhet të jetë një URL e plotë ose një rrugë ngarkimi e vlefshme"
});

const recipeStepSchema = z.object({
  hapi_nr: z.coerce.number().int().positive(),
  pershkrimi: z.string().trim().min(1),
  imazhi: recipeImageSchema.optional()
}).strict();

const recipeIngredientSchema = z.object({
  emertimi: z.string().trim().min(1).max(100),
  sasia: z.coerce.number().positive(),
  njesia: z.string().trim().min(1).max(50)
}).strict();

export const createRecipeBodySchema = z.object({
  titulli: z.string().trim().min(2).max(150),
  pershkrimi: z.string().trim().min(10),
  koha_pergatitjes: z.coerce.number().int().nonnegative(),
  koha_gatimit: z.coerce.number().int().nonnegative(),
  porcione: z.coerce.number().int().positive(),
  veshtiresija: z.enum(["Lehte", "Mesatare", "Veshtire"]),
  imazhi: recipeImageSchema.optional(),
  user_id: z.coerce.number().int().positive().optional(),
  category_id: z.coerce.number().int().positive(),
  steps: z.array(recipeStepSchema).min(1),
  ingredients: z.array(recipeIngredientSchema).min(1),
  tags: z.array(z.string().trim().min(1).max(50)).default([])
}).strict();

export const recipeIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
}).strict();

export const updateRecipeBodySchema = z.object({
  titulli: z.string().trim().min(2).max(150).optional(),
  pershkrimi: z.string().trim().min(10).optional(),
  koha_pergatitjes: z.coerce.number().int().nonnegative().optional(),
  koha_gatimit: z.coerce.number().int().nonnegative().optional(),
  porcione: z.coerce.number().int().positive().optional(),
  veshtiresija: z.enum(["Lehte", "Mesatare", "Veshtire"]).optional(),
  imazhi: recipeImageSchema.optional(),
  user_id: z.coerce.number().int().positive().optional(),
  category_id: z.coerce.number().int().positive().optional()
}).strict();
