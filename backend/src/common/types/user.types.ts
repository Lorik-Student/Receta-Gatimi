import type { Id } from "./index.js";

export enum UserRole {
    guest = "guest",
    user = "user",
    chef = "chef",
    admin = "admin"
}

export function roleToId(role: UserRole): Id {
    switch (role) {
        case UserRole.guest: return 1 as Id;
        case UserRole.user: return 2 as Id;
        case UserRole.chef: return 3 as Id;
        case UserRole.admin: return 4 as Id;
    } 
}

export function roleIdToRole(roleId: Id): UserRole | null {
    switch (roleId) {
        case 1: return UserRole.guest;
        case 2: return UserRole.user;
        case 3: return UserRole.chef;
        case 4: return UserRole.admin;
        default: return null;
    }
}


export interface User {
    id: Id;
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
    id: Id;
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
