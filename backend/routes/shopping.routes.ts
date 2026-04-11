import { Router } from "express";
import * as ShoppingService from "../services/shopping.service.js";
import { validate } from "../middleware/validate.js";
import { createShoppingListBodySchema } from "../schemas/shopping.schema.js";

const router = Router();    

router.post("/", validate({ body: createShoppingListBodySchema }), async (req, res) => {
    const { user_id, emertimi, items } = req.body;
    const id = await ShoppingService.createFullList(user_id, emertimi, items);
    res.status(201).json({ listId: id });
});

export default router;