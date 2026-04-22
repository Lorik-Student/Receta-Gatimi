import * as Service from "./user.service.js";
import { type Request, type Response } from "express";
import type { Id } from "../../common/types/index.js";
import { NotFoundError, UnauthorizedError } from "../../common/http-errors.js";
import type { RequestWithClaims } from "../../common/middleware/auth.middleware.js";

export async function getUserProfile(req: Request, res: Response) { 
    const sub = (req as RequestWithClaims).claims.sub;
    if (!sub) throw new UnauthorizedError("TOKEN_SUB_MISSING", "Missing sub claim");
    const userId = parseInt(sub, 10) as Id;
    const user = await Service.getUserProfile(userId);
    if (!user) {
        throw new NotFoundError("USER_NOT_FOUND", "User not found");
    }
    res.json(user);
}

export async function getAllUserProfiles(req: Request, res: Response) { 
    const users = await Service.getAllUserProfiles();
    res.json(users);
}