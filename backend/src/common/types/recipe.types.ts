import type { Id } from "./index.js";

export interface Recipe {
    id: Id;
    titulli: string;
    pershkrimi: string;
    koha_pergatitjes: number;
    koha_gatimit: number;
    porcione: number;
    veshtiresija: "Easy" | "Medium" | "Hard";
    imazhi?: string;
    user_id: Id;
    category_id: Id;
}

export interface RecipeIngredient {
    ingredient_id: Id;
    sasia: number;
    njesia: string;
}

export interface RecipeStep {
    hapi_nr: number;
    pershkrimi: string;
    imazhi?: string;
}

export interface Review {
    id: Id;
    recipe_id: Id;
    user_id: Id;
    vleresimi: number;
    komenti: string;
    data: Date;
}