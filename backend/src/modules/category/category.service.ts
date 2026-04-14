import * as CategoryModel from "./category.model.js";
import type { Category, Id } from "../../common/types/index.js";

export async function getCategories(): Promise<Category[]> {
  return CategoryModel.findAllCategories();
}

export async function createCategory(category: Omit<Category, "id">): Promise<Id> {
  return CategoryModel.insertCategory(category);
}
