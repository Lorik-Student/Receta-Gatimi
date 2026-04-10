import type { Request, Response } from "express";
import * as CategoryModel from "../models/category.model.js";

export async function getCategories(req: Request, res: Response) {
    const categories = await CategoryModel.findAllCategories();
    res.json(categories);
}

export async function postCategory(req: Request, res: Response) {
    const id = await CategoryModel.insertCategory(req.body);
    res.status(201).json({ id });
}