import type { Request, Response } from "express";
import * as CategoryService from "./category.service.js";

export async function getCategories(req: Request, res: Response) {
    const categories = await CategoryService.getCategories();
    res.json(categories);
}

export async function postCategory(req: Request, res: Response) {
    const id = await CategoryService.createCategory(req.body);
    res.status(201).json({ id });
}