import { Router } from "express";
import * as CategoryController from "./category.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { createCategoryBodySchema } from "./category.schema.js";

const router = Router();
router.get("/", CategoryController.getCategories);
router.post("/", validate({ body: createCategoryBodySchema }), CategoryController.postCategory);

export default router;