import * as RecipeModel from "./recipe.model.js";
import * as UserModel from "../user/user.model.js";

export async function getDashboardData() {
    const popularRecipes = await RecipeModel.getPopularRecipes();
    const activeAuthors = await UserModel.getActiveAuthors();
    return { popularRecipes, activeAuthors };
}