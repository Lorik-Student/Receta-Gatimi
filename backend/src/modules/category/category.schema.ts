import { z } from "zod";

export const createCategoryBodySchema = z.object({
    emertimi: z.string().trim().min(2).max(80),
    pershkrimi: z.string().trim().max(500).optional(),
    imazhi: z.url().trim().max(1024).optional()
}).strict();
