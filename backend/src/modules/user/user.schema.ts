import { z } from "zod";
import { UserRole } from "../../common/types/index.js";

export const userIdParamsSchema = z.object({
    id: z.coerce.number().int().positive()
}).strict();


export const UserInsertParamsSchema = z.object({
    emri: z.string().trim().min(2).max(50),
    mbiemri: z.string().trim().min(2).max(50),
    email: z.email().trim().max(255),
    phone_number: z.string().trim().max(20).optional(),
    password: z.string().min(8).max(128),
    roles: z.array(z.enum(UserRole)),
    email_confirmed: z.boolean().optional(),
    lockout_enabled: z.boolean().optional(),
    access_failed_count: z.coerce.number().int().nonnegative().optional(),
    statusi: z.string().trim().max(50).optional()
});

export const UserUpdateParamsSchema = z.object({
    emri: z.string().trim().min(2).max(50).optional(),
    mbiemri: z.string().trim().min(2).max(50).optional(),
    email: z.email().trim().max(255).optional(),
    phone_number: z.string().trim().max(20).optional(),
    password: z.string().min(8).max(128).optional(),
    roles: z.array(z.enum(UserRole)).optional(),
    email_confirmed: z.boolean().optional(),
    lockout_enabled: z.boolean().optional(),
    access_failed_count: z.coerce.number().int().nonnegative().optional(),
    statusi: z.string().trim().max(50).optional()
}).strict();