import { Router, type Request, type Response } from "express";
import * as Model from "../models/user.model.js";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
    const users = await Model.findAllUserProfiles();
    res.json(users);
   
});

export default router;