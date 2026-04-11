import * as Service from "../services/user.service.js";
import { type Request, type Response } from "express";
import type { Id } from "../types.js";

export async function getUserProfile(req: Request, res: Response) { 
    const id = parseInt(req.params.id as string) as Id;
    const user = await Service.getUserProfile(id);
    res.json(user);
}

export async function getAllUserProfiles(req: Request, res: Response) { 
    const users = await Service.getAllUserProfiles();
    res.json(users);
}