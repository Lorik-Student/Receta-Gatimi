import type { Id } from "./index.js";

export interface Category {
    id: Id;
    emertimi: string;
    pershkrimi?: string;
    imazhi?: string;
}