import * as RecipeModel from "./recipe.model.js";
import * as UserModel from "../user/user.model.js";
import type { Id } from "../../common/types/index.js";

export async function getDashboardData() {
    const popularRecipes = await RecipeModel.getPopularRecipes();
    const activeAuthors = await UserModel.getActiveAuthors();
    return { popularRecipes, activeAuthors };
}

export const createRecipe = (data: any) => {
    const { steps, ingredients, tags, ...recipeData } = data;
    return RecipeModel.insertFullRecipe(recipeData, steps, ingredients, tags);
};

export const fetchAllRecipes = () => RecipeModel.getAllRecipes();

export const removeRecipe = (id: Id) => RecipeModel.deleteRecipe(id);

export const fetchIngredients = () => RecipeModel.getAllIngredients();

export const fetchTags = () => RecipeModel.getAllTags();