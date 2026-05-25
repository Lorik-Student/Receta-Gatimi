export interface Recipe {
    id: number;
    titulli: string;
    pershkrimi: string;
    koha_pergatitjes: number;
    koha_gatimit: number;
    porcione: number;
    veshtiresija: "Easy" | "Medium" | "Hard";
    imazhi?: string;
    user_id: number;
    category_id: number;
    author_id?: number;
    author_emri?: string;
    author_mbiemri?: string;
    is_hidden?: boolean;
    hidden_at?: Date | null;
    hidden_reason?: string | null;
}

export interface RecipeIngredient {
    ingredient_id: number;
    sasia: number;
    njesia: string;
}

export interface RecipeStep {
    hapi_nr: number;
    pershkrimi: string;
    imazhi?: string;
}

export interface Review {
    id: number;
    recipe_id: number;
    user_id: number;
    vleresimi: number;
    komenti: string;
    data: Date;
}

export interface Favorite {
    id: number;
    user_id: number;
    recipe_id: number;
    data: Date;
}

export interface FavoriteRecipeItem {
    favorite_id: number;
    recipe_id: number;
    titulli: string;
    imazhi?: string;
    data: Date;
}

export interface FavoriteCategory {
    id: number;
    user_id: number;
    emertimi: string;
    is_public: boolean;
    pershkrimi?: string | null;
    imazhi?: string | null;
    data_krijimit: Date;
}

export interface FavoriteCategoryWithRecipes extends FavoriteCategory {
    recipes: FavoriteRecipeItem[];
}
