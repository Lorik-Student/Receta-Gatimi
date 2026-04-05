import { type Request, type Response, Router } from "express";
import * as UserModel from "../models/User.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => { 
    const userData: UserModel.UserInsert = req.body;
    const existingUser = await UserModel.find(userData.email);
    if (existingUser) { 
        return res.status(400).json({ message: "Email already in use" }); 
    }

    const newUser: UserModel.UserInsert = {
        ...userData,
        email_confirmed: false,
        lockout_enabled: false,
        access_failed_count: 0,
        status: "active"
    };
    
    const userId = await UserModel.insert(newUser);
    return res.status(201).json({ id: userId });

});

export default router;