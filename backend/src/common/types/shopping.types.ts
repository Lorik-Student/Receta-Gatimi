export interface ShoppingList {
    id: number;
    user_id: number;
    emertimi: string;
    data_krijimit: Date;
}

export interface ListItem {
    id: number;
    shopping_list_id: number;
    ingredient_id: number;
    sasia: string;
    eshte_blere: boolean;
}
