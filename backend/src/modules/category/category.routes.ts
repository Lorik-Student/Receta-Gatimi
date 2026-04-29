import { Router } from "express";
import * as CategoryController from "./category.controller.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import { createCategoryBodySchema } from "./category.schema.js";
import { adminAuthMiddleware } from "../../common/middleware/auth.middleware.js";

const router = Router();
router.get("/", CategoryController.getCategories);
router.post("/", adminAuthMiddleware, validate({ body: createCategoryBodySchema }), CategoryController.postCategory);
router.patch("/:id", adminAuthMiddleware, CategoryController.updateCategory);
router.delete("/:id", adminAuthMiddleware, CategoryController.deleteCategory);

export default router;