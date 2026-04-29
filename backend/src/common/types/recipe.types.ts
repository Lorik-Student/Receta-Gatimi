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
