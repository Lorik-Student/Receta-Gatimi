import type { Request, Response } from "express";
import * as CategoryService from "./category.service.js";
import { NotFoundError, BadRequestError } from "../../common/http-errors.js";
export async function getCategories(req: Request, res: Response) {
    const categories = await CategoryService.getCategories();
    res.json(categories);
}

export async function postCategory(req: Request, res: Response) {
    const id = await CategoryService.createCategory(req.body);
    res.status(201).json({ id });
}

export async function updateCategory(req: Request, res: Response) {
    const success = await CategoryService.updateCategory(Number(req.params.id), req.body);
    if (!success) {
        throw new NotFoundError("CATEGORY_NOT_FOUND", "Category not found or no changes made.");
    }
    res.json({ message: "Category updated successfully." });
}

export async function deleteCategory(req: Request, res: Response) {
    const success = await CategoryService.deleteCategory(Number(req.params.id));    
    if (!success) {
        throw new NotFoundError("CATEGORY_NOT_FOUND", "Category not found.");
    }
    res.status(204).send();
}
