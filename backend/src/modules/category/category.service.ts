import * as CategoryModel from "./category.model.js";
import type { Category } from "../../common/types/category.types.js";

export async function getCategories(): Promise<Category[]> {
  return CategoryModel.findAllCategories();
}

export async function createCategory(category: Omit<Category, "id">): Promise<number> {
  return CategoryModel.insertCategory(category);
}

export async function updateCategory(id: number, category: Partial<Omit<Category, "id">>): Promise<boolean> {
  return CategoryModel.updateCategory(id, category);
}

export async function deleteCategory(id: number): Promise<boolean> {
  return CategoryModel.deleteCategory(id);
}
