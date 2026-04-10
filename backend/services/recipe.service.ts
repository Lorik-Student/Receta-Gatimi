import * as RecipeModel from "../models/recipe.model.js";
import * as UserModel from "../models/user.model.js";

export async function getDashboardData() {
    const popularRecipes = await RecipeModel.getPopularRecipes();
    const activeAuthors = await UserModel.getActiveAuthors();
    return { popularRecipes, activeAuthors };
}