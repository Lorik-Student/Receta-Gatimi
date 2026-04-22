import { z } from "zod";

export const signUpBodySchema = z.object({
    emri: z.string().trim().min(2).max(60),
    mbiemri: z.string().trim().min(2).max(60),
    email: z.email().trim(),
    password: z.string().min(8).max(128),
    phone_number: z.string().trim().min(6).max(25).nullable().optional()
}).strict();

export const loginBodySchema = z.object({
    email: z.email().trim(),
    password: z.string().min(8).max(128)
}).strict();
