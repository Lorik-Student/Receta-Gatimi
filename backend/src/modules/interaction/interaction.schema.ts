import { z } from "zod";

export const reviewIdParamsSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();

export const recipeReviewParamsSchema = z.object({
    recipeId: z.coerce.number().int().positive()
}).strict();

export const reviewBodySchema = z.object({
    recipe_id: z.coerce.number().int().positive(),
    vleresimi: z.coerce.number().int().min(1).max(5),
    komenti: z.string().trim().max(1000).optional().default("")
}).strict();

export const reviewUpdateBodySchema = reviewBodySchema.omit({ recipe_id: true });

export const favoriteBodySchema = z.object({
    recipeId: z.coerce.number().int().positive(),
    categoryId: z.coerce.number().int().positive().optional()
}).strict();

export const favoriteRecipeParamsSchema = z.object({
    recipeId: z.coerce.number().int().positive()
}).strict();

export const favoriteCategoryParamsSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();

export const publicFavoriteUserParamsSchema = z.object({
    userId: z.coerce.number().int().positive()
}).strict();

export const favoriteCategoryBodySchema = z.object({
    emertimi: z.string().trim().min(2).max(80),
    pershkrimi: z.string().trim().max(500).optional(),
    is_public: z.boolean().optional().default(false)
}).strict();

export const favoriteCategoryUpdateBodySchema = z.object({
    emertimi: z.string().trim().min(2).max(80).optional(),
    pershkrimi: z.string().trim().max(500).optional(),
    is_public: z.boolean().optional()
}).strict();

export const recipeReportBodySchema = z.object({
    recipe_id: z.coerce.number().int().positive(),
    reason: z.string().trim().min(10).max(500)
}).strict();

export const userReportBodySchema = z.object({
    user_id: z.coerce.number().int().positive(),
    reason: z.string().trim().min(10).max(500)
}).strict();

export const bugReportBodySchema = z.object({
    subject: z.string().trim().min(3).max(120),
    message: z.string().trim().min(10).max(1000)
}).strict();

export const recipeReportParamsSchema = z.object({
    recipeId: z.coerce.number().int().positive()
}).strict();

export const userReportParamsSchema = z.object({
    userId: z.coerce.number().int().positive()
}).strict();

export const bugReportParamsSchema = z.object({
    bugReportId: z.coerce.number().int().positive()
}).strict();
