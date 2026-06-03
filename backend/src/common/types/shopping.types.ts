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

export interface ShoppingListItemDetails extends ListItem {
    ingredient_emertimi: string;
    ingredient_njesia_matese: string | null;
}

export interface ShoppingListWithItems extends ShoppingList {
    items: ShoppingListItemDetails[];
}
