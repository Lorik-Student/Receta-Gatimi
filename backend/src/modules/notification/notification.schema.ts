import { z } from "zod";

export const notificationListQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(50).optional().default(10)
}).strict();