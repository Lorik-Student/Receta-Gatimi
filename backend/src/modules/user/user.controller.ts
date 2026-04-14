import * as Service from "./user.service.js";
import { type Request, type Response } from "express";
import type { Id } from "../../common/types/index.js";
import { HttpError } from "../../common/errors/http-error.js";

export async function getUserProfile(req: Request, res: Response) { 
    const id = parseInt(req.params.id as string) as Id;
    const user = await Service.getUserProfile(id);
    if (!user) {
        throw new HttpError(404, "User not found", { code: "USER_NOT_FOUND" });
    }
    res.json(user);
}

export async function getAllUserProfiles(req: Request, res: Response) { 
    const users = await Service.getAllUserProfiles();
    res.json(users);
}