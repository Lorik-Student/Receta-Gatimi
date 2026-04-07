import type { ResultSetHeader, RowDataPacket, QueryResult } from "mysql2";
import db from "../config/db.js"
import type { 
    Id, UserProfile
} from "../types.js";


export enum UserRole { 
    guest = 1,
    user = 2,
    chef = 3,
    admin = 4
}

const USER_TABLE = "users";
const USER_ROLE_TABLE = "userroles";

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


function mapUserRow(row: any): User {
    return {
        ...row,
        email_confirmed: Boolean(row.email_confirmed),
        lockout_enabled: Boolean(row.lockout_enabled),
        // Convert "1,2" string from GROUP_CONCAT to [1, 2] numeric enum array
        roles: typeof row.roles === "string" 
            ? row.roles.split(",").map(Number) as UserRole[] 
            : []
    };
}

async function addRoleToUser(userId: Id, role: UserRole): Promise<void> {
    const query = `INSERT IGNORE INTO ${USER_ROLE_TABLE} (user_id, role_id) VALUES (?, ?)`;
    await db.query<ResultSetHeader>(query, [userId, role]);
}

async function insertUser(user: UserInsert): Promise<Id> {
    const query = `
        INSERT INTO ${USER_TABLE} 
        (emri, mbiemri, email, password_hash, phone_number, email_confirmed, lockout_enabled, access_failed_count, statusi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query<ResultSetHeader>(query, [
        user.emri,
        user.mbiemri,
        user.email,
        user.password_hash,
        user.phone_number ?? null,
        user.email_confirmed ?? false,
        user.lockout_enabled ?? true,
        user.access_failed_count ?? 0,
        user.statusi ?? "active"
    ]);

    const userId = result.insertId as Id;
    const roles = user.roles?.length ? user.roles : [UserRole.guest];

    await Promise.all(roles.map(role => addRoleToUser(userId, role)));

    return userId;
}

async function findUser(email: string): Promise<User | null> {
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

async function findUserById(id: Id): Promise<User | null> {
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

async function findAllUsers(): Promise<User[]> {
    const query = `
        SELECT u.*, GROUP_CONCAT(DISTINCT ur.role_id) as roles
        FROM ${USER_TABLE} u
        LEFT JOIN ${USER_ROLE_TABLE} ur ON u.id = ur.user_id
        GROUP BY u.id
    `;
    const [rows] = await db.query<RowDataPacket[]>(query);
    return rows.map(mapUserRow);
}

async function findAllUserProfiles(): Promise<UserProfile[]> {
    const query = `SELECT emri, mbiemri, email, phone_number FROM ${USER_TABLE}`;
    const [rows] = await db.query<RowDataPacket[]>(query);
    return rows as UserProfile[];
}

async function findUserProfile(email: string): Promise<UserProfile | null> {
    const query = `SELECT emri, mbiemri, email, phone_number FROM ${USER_TABLE} WHERE email = ? LIMIT 1`;
    const [rows] = await db.query<RowDataPacket[]>(query, [email]);
    return (rows[0] as UserProfile) || null;
}

async function existsByEmail(email: string): Promise<boolean> {
    const query = `SELECT 1 FROM ${USER_TABLE} WHERE email = ? LIMIT 1`;
    const [rows] = await db.query<RowDataPacket[]>(query, [email]);
    return rows.length > 0;
}

async function updateUser(id: Id, data: UserUpdate): Promise<void> {
    const entries = Object.entries(data).filter(([_, v]) => v !== undefined);
    if (!entries.length) return;

    const setClause = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([_, value]) => value);

    const query = `UPDATE ${USER_TABLE} SET ${setClause} WHERE id = ?`;
    await db.query<ResultSetHeader>(query, [...values, id]);
}

export { 
    insertUser, 
    findUser, 
    findUserById, 
    findAllUsers, 
    findAllUserProfiles, 
    updateUser,
    existsByEmail, 
    findUserProfile 
};