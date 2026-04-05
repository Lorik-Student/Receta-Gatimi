import { Router, type Request, type Response } from "express";
import * as UserModel from "../models/User.js";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
    const users = await UserModel.findAll();
    return res.json(users);
});

export default router;