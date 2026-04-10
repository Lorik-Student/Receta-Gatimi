import * as Services from "../services/auth.service.js";
import * as Models from "../models/user.model.js";
import { type Request, type Response } from "express";

async function signUp(req: Request, res: Response) { 
    const userId = await Services.createUser(req.body);
    res.status(201).json({ success: true, id: userId, message: "User created successfully" });
    
}

async function login(req: Request, res: Response) { 
    await Services.authenticate(req.body);
}

export { signUp, login };
