import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../../config/db.js"
import type { Id, UserProfile } from "../../common/types/index.js";

export enum UserRole {
    guest = "guest",
    user = "user",
    chef = "chef",
    admin = "admin"
}

export const USER_TABLE = "users";
export const USER_ROLE_TABLE = "userroles";

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

export type UserInsert = Omit<User, "id" | "data_krijimit" | "roles"> & {
    roles?: UserRole[];
    email_confirmed?: boolean;
    lockout_enabled?: boolean;
    access_failed_count?: number;
    statusi?: string;
};

export type UserUpdate = Partial<Omit<User, "id" | "data_krijimit" | "roles">>;

function roleToId(role: UserRole): Id {
    switch (role) {
        case UserRole.guest: return 1 as Id;
        case UserRole.user: return 2 as Id;
        case UserRole.chef: return 3 as Id;
        case UserRole.admin: return 4 as Id;
    } 
}


function mapUserRow(row: any): User {
    return {
        ...row,
        email_confirmed: Boolean(row.email_confirmed),
        lockout_enabled: Boolean(row.lockout_enabled),
        // Convert "guest,admin" string from GROUP_CONCAT to ["guest", "admin"] enum array
        roles: typeof row.roles === "string"
            ? row.roles.split(",") as UserRole[]
            : []
    };
}
export async function addRoleToUser(userId: Id, roleId: Id): Promise<void> {
    const query = `INSERT IGNORE INTO ${USER_ROLE_TABLE} (user_id, role_id) VALUES (?, ?)`;
    await db.query<ResultSetHeader>(query, [userId, roleId]);
}

export async function getUserRoles(userId: Id): Promise<UserRole[]> {
    const query = `SELECT role_id FROM ${USER_ROLE_TABLE} WHERE user_id = ?`;
    const [rows] = await db.query<RowDataPacket[]>(query, [userId]);
    return rows.map(r => r.role_id as UserRole);
}
    
export async function insertUser(user: UserInsert): Promise<Id> {
    const query = `
        INSERT INTO ${USER_TABLE}
        (emri, mbiemri, email, password_hash, phone_number,
         email_confirmed, lockout_enabled, access_failed_count, statusi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query<ResultSetHeader>(query, [
        user.emri, user.mbiemri, user.email, user.password_hash,
        user.phone_number ?? null, user.email_confirmed,
        user.lockout_enabled, user.access_failed_count, user.statusi
    ]);
    const userId = result.insertId as Id;
    await Promise.all((user.roles ?? []).map(role => addRoleToUser(userId, roleToId(role))));
    return userId;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const query = `
        SELECT u.*, GROUP_CONCAT(DISTINCT ur.role_id) as roles 
        FROM ${USER_TABLE} u
        LEFT JOIN ${USER_ROLE_TABLE} ur ON u.id = ur.user_id
        WHERE u.email = ?
        GROUP BY u.id
        LIMIT 1
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [email]);
    return rows.length ? mapUserRow(rows[0]) : null;
}

export async function findUser(id: Id): Promise<User | null> {
    const query = `
        SELECT u.*, GROUP_CONCAT(DISTINCT ur.role_id) as roles
        FROM ${USER_TABLE} u
        LEFT JOIN ${USER_ROLE_TABLE} ur ON u.id = ur.user_id
        WHERE u.id = ?
        GROUP BY u.id
        LIMIT 1
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [id]);
    return rows.length ? mapUserRow(rows[0]) : null;
}

export async function findAllUsers(): Promise<User[]> {
    const query = `
        SELECT u.*, GROUP_CONCAT(DISTINCT ur.role_id) as roles
        FROM ${USER_TABLE} u
        LEFT JOIN ${USER_ROLE_TABLE} ur ON u.id = ur.user_id
        GROUP BY u.id
    `;
    const [rows] = await db.query<RowDataPacket[]>(query);
    return rows.map(mapUserRow);
}

export async function findAllUserProfiles(): Promise<UserProfile[]> {
    const query = `SELECT id, emri, mbiemri, email, phone_number FROM ${USER_TABLE}`;
    const [rows] = await db.query<RowDataPacket[]>(query);
    return rows as UserProfile[];
}

export async function findUserProfile(id: Id): Promise<UserProfile | null> {
    const query = `SELECT id, emri, mbiemri, email, phone_number FROM ${USER_TABLE} WHERE id = ? LIMIT 1`;
    const [rows] = await db.query<RowDataPacket[]>(query, [id]);
    return (rows[0] as UserProfile) || null;
}

export async function existsByEmail(email: string): Promise<boolean> {
    const query = `SELECT 1 FROM ${USER_TABLE} WHERE email = ? LIMIT 1`;
    const [rows] = await db.query<RowDataPacket[]>(query, [email]);
    return rows.length > 0;
}

export async function updateUser(id: Id, data: UserUpdate): Promise<void> {
    const entries = Object.entries(data).filter(([_, v]) => v !== undefined);
    if (!entries.length) return;

    const setClause = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([_, value]) => value);

    const query = `UPDATE ${USER_TABLE} SET ${setClause} WHERE id = ?`;
    await db.query<ResultSetHeader>(query, [...values, id]);
}

// Per dashboard: active authors
export async function getActiveAuthors() {
    const [rows] = await db.query(`
        SELECT u.emri, u.mbiemri, COUNT(r.id) as recipe_count 
        FROM Users u 
        JOIN Recipes r ON u.id = r.user_id 
        GROUP BY u.id ORDER BY recipe_count DESC LIMIT 5
    `);
    return rows;
}
