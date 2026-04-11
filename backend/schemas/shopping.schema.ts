import { z } from "zod";

const shoppingListItemSchema = z.object({
    ingredient_id: z.coerce.number().int().positive(),
    sasia: z.union([z.coerce.number().positive(), z.string().trim().min(1)]).transform((value) => String(value))
}).strict();

export const createShoppingListBodySchema = z.object({
    user_id: z.coerce.number().int().positive(),
    emertimi: z.string().trim().min(1).max(120),
    items: z.array(shoppingListItemSchema).min(1)
}).strict();