export type FavoriteRecipe = {
  favorite_id: number;
  recipe_id: number;
  titulli?: string;
  imazhi?: string;
};

export type FavoriteCategory = {
  id: number;
  emertimi: string;
  is_public: boolean;
  imazhi?: string;
  recipes: FavoriteRecipe[];
};

export type FavoritesState = {
  categories: FavoriteCategory[];
  uncategorized: FavoriteRecipe[];
  recipeIds: Set<number>;
};
