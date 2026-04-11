import * as Services from "../services/auth.service.js";
import { type Request, type Response } from "express";

async function signup(req: Request, res: Response) { 
    const userId = await Services.createUser(req.body);
    return res.status(201).json({ success: true, id: userId, message: "User created successfully" });
    
}

async function login(req: Request, res: Response) { 
    const userId = await Services.authenticate(req.body);
    if (!userId) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    return res.status(200).json({ success: true, id: userId, message: "Login successful" });
}

export { signup, login };
