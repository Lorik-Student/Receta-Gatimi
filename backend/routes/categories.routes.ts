import { Router } from "express";
import * as CategoryController from "../controllers/category.controller.js";

const router = Router();
router.get("/", CategoryController.getCategories);
router.post("/", CategoryController.postCategory);

export default router;