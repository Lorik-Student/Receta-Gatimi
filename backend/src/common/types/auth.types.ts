export type RefreshToken = { 
    id: number;
    user_id: number;
    token: string;
    expires: Date;
    created: Date;
    revoked: Date | null;
}