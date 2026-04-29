export enum UserRole {
    guest = "guest",
    user = "user",
    chef = "chef",
    admin = "admin"
}

export interface User {
    id: number;
    emri: string;
    mbiemri: string;
    email: string;
    phone_number?: string | null;
    password_hash: string;
    roles: UserRole[];
    email_confirmed: boolean;
    lockout_enabled: boolean;
    access_failed_count: number;
    data_krijimit: Date;
    statusi: string;
}

export interface UserProfile {
    id: number;
    emri: string;
    mbiemri: string;
    email: string;
    roles: UserRole[];
    phone_number?: string | null;
}

export interface UserInsert {
    emri: string;
    mbiemri: string;
    email: string;
    phone_number?: string | null;
    password: string;
    roles: UserRole[];
    email_confirmed?: boolean;
    lockout_enabled?: boolean;
    access_failed_count?: number;
    statusi?: string;
}

export type UserInsertTable = Omit<UserInsert, "password"> & { password_hash: string };

export interface UserUpdate {
    emri?: string;
    mbiemri?: string;
    email?: string;
    phone_number?: string | null;
    password?: string;
    roles?: UserRole[];
    email_confirmed?: boolean;
    lockout_enabled?: boolean;
    access_failed_count?: number;
    statusi?: string;
}
