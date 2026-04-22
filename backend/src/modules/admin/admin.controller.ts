import type { Response,  Request } from "express";
import * as AdminService from "./admin.service.js";
import * as UserService from "../user/user.service.js";
import type { Id, UserInsert, UserUpdate } from "../../common/types/index.js";

export async function getUsers(req: Request, res: Response) {
    const users = await UserService.getUsers();
    res.status(200).json({ success: true, users });
}

export async function getUser(req: Request, res: Response) { 
    const userId = parseInt(req.params.id as string) as Id;
    const user = await UserService.getUser(userId);
    res.status(200).json({ success: true, user });
}

export async function createUser(req: Request, res: Response) {
    const userData = req.body as UserInsert;
    const user = await UserService.createUser(userData);
    res.status(201).json({ success: true, user });
}

export async function updateUser(req: Request, res: Response) { 
    const userId = Number(req.params.id) as Id;
    const userData = req.body as UserUpdate;
    const updatedUser = await UserService.updateUser(userId, userData);
    res.status(200).json({ success: true, user: updatedUser });
}

export async function deleteUser(req: Request, res: Response) { 
    const userId = Number(req.params.id) as Id;
    await UserService.deleteUser(userId);
    res.status(204).send();
}