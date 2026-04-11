import { Router } from "express";
import * as ShoppingService from "../services/shopping.service.js";

const router = Router();    

router.post("/", async (req, res) => {
    const { user_id, emertimi, items } = req.body;
    const id = await ShoppingService.createFullList(user_id, emertimi, items);
    res.status(201).json({ listId: id });
});

export default router;