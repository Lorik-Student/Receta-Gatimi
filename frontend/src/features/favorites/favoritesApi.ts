import { apiFetch } from "../../api";
import type { FavoriteCategory, FavoriteRecipe, FavoritesState } from "./types";

function normalizeCategories(categories: unknown): FavoriteCategory[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map((category) => {
    const record = category as FavoriteCategory;
    return {
      ...record,
      recipes: Array.isArray(record.recipes) ? record.recipes : [],
    };
  });
}

function normalizeRecipes(recipes: unknown): FavoriteRecipe[] {
  return Array.isArray(recipes) ? recipes as FavoriteRecipe[] : [];
}

function collectFavoriteRecipeIds(categories: FavoriteCategory[], uncategorized: FavoriteRecipe[]) {
  const recipeIds = new Set<number>();

  const addRecipeId = (recipe: FavoriteRecipe) => {
    const recipeId = Number(recipe.recipe_id);
    if (Number.isInteger(recipeId) && recipeId > 0) {
      recipeIds.add(recipeId);
    }
  };

  categories.forEach((category) => category.recipes.forEach(addRecipeId));
  uncategorized.forEach(addRecipeId);

  return recipeIds;
}

export async function getFavoritesState(): Promise<FavoritesState> {
  const response = await apiFetch("/interactions/favorites");
  const favorites = (response as Record<string, any>)?.favorites ?? {};
  const categories = normalizeCategories(favorites.categories);
  const uncategorized = normalizeRecipes(favorites.uncategorized);

  return {
    categories,
    uncategorized,
    recipeIds: collectFavoriteRecipeIds(categories, uncategorized),
  };
}

export async function getFavoriteCategories(): Promise<FavoriteCategory[]> {
  const response = await apiFetch("/interactions/favorites/categories");
  return normalizeCategories((response as Record<string, unknown>)?.categories);
}

export async function createFavoriteCategory(name: string): Promise<number | null> {
  const response = await apiFetch("/interactions/favorites/categories", {
    method: "POST",
    body: JSON.stringify({ emertimi: name, is_public: false }),
  });

  if (!response.ok) {
    throw new Error("Failed to create favorite category");
  }

  const createdId = Number((response as Record<string, unknown>)?.id);
  return Number.isInteger(createdId) && createdId > 0 ? createdId : null;
}

export async function saveFavorite(recipeId: number, categoryId?: number) {
  const response = await apiFetch("/interactions/favorites", {
    method: "POST",
    body: JSON.stringify({ recipeId, categoryId }),
  });

  if (!response.ok) {
    throw new Error("Failed to save favorite");
  }
}

export async function removeFavorite(recipeId: number) {
  const response = await apiFetch(`/interactions/favorites/recipe/${recipeId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove favorite");
  }
}
