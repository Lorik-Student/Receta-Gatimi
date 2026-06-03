import { z } from "zod";

const shoppingListItemSchema = z.object({
    ingredient_id: z.coerce.number().int().positive(),
    sasia: z.union([z.coerce.number().positive(), z.string().trim().min(1)]).transform((value) => String(value))
}).strict();

export const shoppingListIdParamsSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();

export const shoppingListItemsParamsSchema = z.object({
    listId: z.coerce.number().int().positive()
}).strict();

export const shoppingListItemParamsSchema = z.object({
    listId: z.coerce.number().int().positive(),
    itemId: z.coerce.number().int().positive()
}).strict();

export const recipeShoppingItemsBodySchema = z.object({
    recipeId: z.coerce.number().int().positive(),
    ingredientIds: z.array(z.coerce.number().int().positive()).min(1).optional()
}).strict();

export const createShoppingListBodySchema = z.object({
    user_id: z.coerce.number().int().positive(),
    emertimi: z.string().trim().min(1).max(120),
    items: z.array(shoppingListItemSchema).min(1)
}).strict();

export const updateShoppingListBodySchema = z.object({
    emertimi: z.string().trim().min(1).max(120)
}).strict();

export const updateShoppingListItemBodySchema = z.object({
    amount: z.union([z.coerce.number().positive(), z.string().trim().min(1)]).transform((value) => String(value)),
    isBought: z.coerce.boolean()
}).strict();