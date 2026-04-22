import type { Id } from "./index.js";

export type RefreshToken = { 
    id: Id;
    user_id: Id;
    token: string;
    expires: Date;
    created: Date;
    revoked: Date | null;
}