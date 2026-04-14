import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../../config/db.js"
import type { Id } from "../../common/types/index.js";

const REFRESH_TOKEN_TABLE = "refreshtokens";

export async function findRefreshToken(token: string): Promise<any | null> { 
    const query = `SELECT * FROM ${REFRESH_TOKEN_TABLE} WHERE token = ? LIMIT 1`;
    const [rows] = await db.query<RowDataPacket[]>(query, [token]);
    return rows.length ? rows[0] : null;
}

export async function saveRefreshToken(userId: Id, token: string): Promise<void> { 
    const query = `INSERT INTO 
                ${REFRESH_TOKEN_TABLE} (user_id, token, expires, created, revoked) 
                VALUES (?, ?, ?, ?, ?)`;
    await db.query<ResultSetHeader>(query, [userId, token, new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), new Date(), null]);
}

export async function markRefreshTokenAsUsed(token: string): Promise<Id> { 
    const query = `UPDATE ${REFRESH_TOKEN_TABLE}
                    SET revoked = ${Date.now()}
                    WHERE token = ?`;
    const [result] = await db.query<ResultSetHeader>(query, [token]);
    return result.insertId as Id;
}