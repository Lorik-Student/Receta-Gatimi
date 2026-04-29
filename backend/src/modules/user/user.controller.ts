import * as Service from "./user.service.js";
import { type Request, type Response } from "express";
import type {  UserInsert, UserUpdate } from "../../common/types/index.js";
import type { RequestWithClaims } from "../../common/middleware/auth.middleware.js";

export async function getUsers(req: Request, res: Response) {
    const users = await Service.getUsers();
    res.status(200).json({ success: true, users });
}

export async function getUser(req: Request, res: Response) { 
    const userId = Number(req.params.id);
    const user = await Service.getUser(userId);
    res.status(200).json({ success: true, user });
}

export async function createUser(req: Request, res: Response) {
    const userData = req.body as UserInsert;
    const user = await Service.createUser(userData);
    res.status(201).json({ success: true, user });
}

export async function updateUser(req: Request, res: Response) { 
    const userId = Number(req.params.id);
    const userData = req.body as UserUpdate;
    const updatedUser = await Service.updateUser(userId, userData);
    res.status(200).json({ success: true, user: updatedUser });
}

export async function deleteUser(req: Request, res: Response) { 
    const userId = Number(req.params.id);
    await Service.deleteUser(userId);
    res.status(204).send();
}

export async function getUserProfile(req: Request, res: Response) { 
    const sub = (req as RequestWithClaims).claims?.sub;
    let userId: number; 
    if (sub)  
        userId = Number(sub);
    else if (req.params.id)
        userId = Number(req.params.id);
    else throw new Error("Missing ID resolution middleware");

    const user = await Service.getUserProfile(userId);
    res.status(200).json({ success: true, user });
}

export async function getAllUserProfiles(req: Request, res: Response) { 
    const users = await Service.getAllUserProfiles();
    res.status(200).json({ success: true, users });
}