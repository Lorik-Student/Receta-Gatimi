import * as RecipeModel from "./recipe.model.js";
import * as UserModel from "../user/user.model.js";
import { NotFoundError } from "../../common/http-errors.js";
import { createRecipeBodySchema  } from "./recipe.schema.js";
import {z} from "zod";

export type CreateRecipeBody = z.infer<typeof createRecipeBodySchema>;

export async function getDashboardData() {
    const popularRecipes = await RecipeModel.getPopularRecipes();
    const activeAuthors = await UserModel.getActiveAuthors();
    return { popularRecipes, activeAuthors };
}

export async function getRecipe(id: number) { 
    const recipe = await RecipeModel.getRecipeById(id);
    if (!recipe) {
        throw new NotFoundError("RECIPE_NOT_FOUND", "Recipe not found");
    }
    return recipe;
}

export const createRecipe = (data: CreateRecipeBody) => {
    const { steps, ingredients, tags, ...recipeData } = data;
    return RecipeModel.insertFullRecipe(recipeData, steps, ingredients, tags);
};

export const fetchAllRecipes = () => RecipeModel.getAllRecipes();

export const removeRecipe = (id: number) => RecipeModel.deleteRecipe(id);

export const fetchIngredients = () => RecipeModel.getAllIngredients();

export const fetchTags = () => RecipeModel.getAllTags();