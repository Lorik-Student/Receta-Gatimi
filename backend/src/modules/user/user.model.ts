import type { ResultSetHeader, RowDataPacket, PoolConnection } from "mysql2/promise";
import db from "../../config/db.js";
import type { Id, UserInsertTable } from "../../common/types/index.js";
import {
    UserRole,
    type User,
    type UserProfile,
} from "../../common/types/user.types.js";

export const USER_TABLE      = "users";
export const USER_ROLE_TABLE = "userroles";
export const ROLE_TABLE      = "roles";

export type UserUpdateTable = {
    emri?: string;
    mbiemri?: string;
    email?: string;
    phone_number?: string | null;
    password_hash?: string;
    email_confirmed?: boolean;
    lockout_enabled?: boolean;
    access_failed_count?: number;
    statusi?: string;
};

function mapUserRow(row: RowDataPacket): User {
    return {
        ...row,
        email_confirmed: Boolean(row.email_confirmed),
        lockout_enabled: Boolean(row.lockout_enabled),
        roles: row.roles ? (row.roles as string).split(",") : [],
    } as User;
}

function mapUserProfileRow(row: RowDataPacket): UserProfile {
    return {
        ...row,
        roles: row.roles ? (row.roles as string).split(",") : [],
    } as UserProfile;
}

const USER_WITH_ROLES_SELECT = `
    SELECT u.*, GROUP_CONCAT(DISTINCT r.normalized_name) AS roles
    FROM ${USER_TABLE} u
    LEFT JOIN ${USER_ROLE_TABLE} ur ON u.id = ur.user_id
    LEFT JOIN ${ROLE_TABLE} r ON r.id = ur.role_id
`;

const USER_PROFILE_SELECT = `
    SELECT u.id, u.emri, u.mbiemri, u.email, u.phone_number,
           GROUP_CONCAT(DISTINCT r.normalized_name) AS roles
            FROM ${USER_TABLE} u
            LEFT JOIN ${USER_ROLE_TABLE} ur ON u.id = ur.user_id
            LEFT JOIN ${ROLE_TABLE} r ON r.id = ur.role_id
`;

export async function getUserRoles(userId: Id): Promise<UserRole[]> {
    const query = `
        SELECT GROUP_CONCAT(DISTINCT r.normalized_name) AS roles
        FROM ${USER_ROLE_TABLE} ur
        LEFT JOIN ${ROLE_TABLE} r ON r.id = ur.role_id
        WHERE ur.user_id = ?
        GROUP BY ur.user_id
    `;
    const [rows] = await db.query<RowDataPacket[]>(query, [userId]);
    return rows[0]?.roles ? (rows[0].roles as string).split(",") as UserRole[] : [];
}

export async function addRoleToUser(userId: Id, role: UserRole, prevConn?: PoolConnection): Promise<void> {
    const conn = prevConn ?? await db.getConnection();
    const isLocalConnection = !prevConn;

    try {
        const [roleRows] = await conn.query<RowDataPacket[]>(
            `SELECT id FROM ${ROLE_TABLE} WHERE normalized_name = ? LIMIT 1`,
            [role],
        );

        if (!roleRows[0]) {
            return;
        }

        await conn.query<ResultSetHeader>(
            `INSERT IGNORE INTO ${USER_ROLE_TABLE} (user_id, role_id) VALUES (?, ?)`,
            [userId, roleRows[0].id],
        );
    } finally {
        if (isLocalConnection) {
            conn.release();
        }
    }
}

export async function replaceUserRoles(userId: Id, roles: UserRole[], prevConn?: PoolConnection): Promise<void> {
    const conn = prevConn ?? await db.getConnection();
    const isLocalConnection = !prevConn;

    try {
        await conn.query<ResultSetHeader>(`DELETE FROM ${USER_ROLE_TABLE} WHERE user_id = ?`, [userId]);

        for (const role of roles) {
            await addRoleToUser(userId, role, conn);
        }
    } finally {
        if (isLocalConnection) {
            conn.release();
        }
    }
}

export async function findUser(id: Id): Promise<User | null> {
    const [rows] = await db.query<RowDataPacket[]>(
        `${USER_WITH_ROLES_SELECT} WHERE u.id = ? GROUP BY u.id LIMIT 1`,
        [id],
    );
    return rows[0] ? mapUserRow(rows[0]) : null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const [rows] = await db.query<RowDataPacket[]>(
        `${USER_WITH_ROLES_SELECT} WHERE u.email = ? GROUP BY u.id LIMIT 1`,
        [email],
    );
    return rows[0] ? mapUserRow(rows[0]) : null;
}

export async function findAllUsers(): Promise<User[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        `${USER_WITH_ROLES_SELECT} GROUP BY u.id`,
    );
    return rows.map(mapUserRow);
}

export async function findUserProfile(id: Id): Promise<UserProfile | null> {
    const [rows] = await db.query<RowDataPacket[]>(
        `${USER_PROFILE_SELECT} WHERE u.id = ? GROUP BY u.id LIMIT 1`,
        [id],
    );
    return rows[0] ? mapUserProfileRow(rows[0]) : null;
}

export async function findAllUserProfiles(): Promise<UserProfile[]> {
    const [rows] = await db.query<RowDataPacket[]>(
        `${USER_PROFILE_SELECT} GROUP BY u.id`,
    );
    return rows.map(mapUserProfileRow);
}

export async function existsByEmail(email: string): Promise<boolean> {
    const [rows] = await db.query<RowDataPacket[]>(
        `SELECT 1 FROM ${USER_TABLE} WHERE email = ? LIMIT 1`,
        [email],
    );
    return rows.length > 0;
}

export async function insertUser(user: UserInsertTable): Promise<User> {
    const conn = await db.getConnection();

    try {
        await conn.beginTransaction();

        const [result] = await conn.query<ResultSetHeader>(
            `INSERT INTO ${USER_TABLE}
                (emri, mbiemri, email, password_hash, phone_number,
                 email_confirmed, lockout_enabled, access_failed_count, statusi)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user.emri, user.mbiemri, user.email, user.password_hash,
                user.phone_number ?? null, user.email_confirmed,
                user.lockout_enabled, user.access_failed_count, user.statusi,
            ],
        );

        const userId = result.insertId as Id;

        for (const role of user.roles ?? []) {
            await addRoleToUser(userId, role, conn);
        }

        const [rows] = await conn.query<RowDataPacket[]>(
            `${USER_WITH_ROLES_SELECT} WHERE u.id = ? GROUP BY u.id LIMIT 1`,
            [userId],
        );

        if (!rows[0]) throw new Error("Inserted user could not be loaded.");

        await conn.commit();
        return mapUserRow(rows[0]);
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
}

export async function updateUser(id: Id, data: UserUpdateTable): Promise<User | null> {
    const keys = (Object.keys(data) as Array<keyof UserUpdateTable>)
        .filter((key) => data[key] !== undefined);

    if (!keys.length) {
        return findUser(id);
    }

    const setClause = keys.map((key) => `${String(key)} = ?`).join(", ");
    const values = keys.map((key) => data[key]);

    const [result] = await db.query<ResultSetHeader>(
        `UPDATE ${USER_TABLE} SET ${setClause} WHERE id = ?`,
        [...values, id],
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findUser(id);
}

export async function deleteUser(id: Id): Promise<boolean> { 
    const [result] = await db.query<ResultSetHeader>(`DELETE FROM ${USER_TABLE} WHERE id = ?`, [id]);
    return result.affectedRows > 0;
}

// Per dashboard: active authors
export async function getActiveAuthors() {
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT u.emri, u.mbiemri, COUNT(r.id) AS recipe_count
        FROM ${USER_TABLE} u
        JOIN Recipes r ON u.id = r.user_id
        GROUP BY u.id
        ORDER BY recipe_count DESC
        LIMIT 5
    `);
    return rows;
}