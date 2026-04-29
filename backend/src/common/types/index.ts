import type { infer as ZodInfer } from "zod";
import { loginBodySchema, signUpBodySchema } from "../../modules/auth/auth.schema.js";

export type SignUpData = ZodInfer<typeof signUpBodySchema>;

export type LoginData = ZodInfer<typeof loginBodySchema>;

export * from "./user.types.js";
export * from "./category.types.js";
export * from "./recipe.types.js";
export * from "./shopping.types.js";
