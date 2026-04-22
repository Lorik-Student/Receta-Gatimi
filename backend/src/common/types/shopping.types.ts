import type { Id } from "./index.js";

export interface ShoppingList {
    id: Id;
    user_id: Id;
    emertimi: string;
    data_krijimit: Date;
}