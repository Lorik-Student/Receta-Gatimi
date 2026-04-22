import * as CategoryModel from "./category.model.js";
import type { Id } from "../../common/types/index.js";
import type { Category } from "../../common/types/category.types.js";

export async function getCategories(): Promise<Category[]> {
  return CategoryModel.findAllCategories();
}

export async function createCategory(category: Omit<Category, "id">): Promise<Id> {
  return CategoryModel.insertCategory(category);
}
