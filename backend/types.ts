interface SignUpData {                  
    emri: string;                 
    mbiemri: string;                 
    email: string;
    password: string;             
    phone_number?: string | null;   
}

interface LoginData { 
    email: string;
    password: string;
}


type Id = number & { __brand: "Id"};

interface UserProfile { 
    id: Id;                 
    emri: string;                 
    mbiemri: string;                 
    email: string;                 
    phone_number?: string | null;   
}

type Role = 'admin' | 'user' | 'editor';


export type { SignUpData, UserProfile, Id, LoginData, Role };

export interface Category {
    id: Id;
    emertimi: string;
    pershkrimi?: string;
    imazhi?: string;
}

export interface Recipe {
    id: Id;
    titulli: string;
    pershkrimi: string;
    koha_pergatitjes: number;
    koha_gatimit: number;
    porcione: number;
    veshtiresija: 'Easy' | 'Medium' | 'Hard';
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

export interface ShoppingList {
    id: Id;
    user_id: Id;
    emertimi: string;
    data_krijimit: Date;
}