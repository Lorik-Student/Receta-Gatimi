import { Router } from "express";
import * as ShoppingController from "./shopping.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { createShoppingListBodySchema } from "./shopping.schema.js";

const router = Router();    

router.post("/", validate({ body: createShoppingListBodySchema }), ShoppingController.createShoppingList);

export default router;