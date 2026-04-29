import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import db from "../../config/db.js"
import type { RefreshToken } from "../../common/types/auth.types.js";

const REFRESH_TOKEN_TABLE = "refreshtokens";
const USER_TOKEN_TABLE = "usertokens";

export async function findRefreshToken(token: string): Promise<RefreshToken | null> { 
    const query = `SELECT * FROM ${REFRESH_TOKEN_TABLE} WHERE token = ? LIMIT 1`;
    const [rows] = await db.query<RowDataPacket[]>(query, [token]);
    return rows.length ? rows[0] as RefreshToken : null;
}

export async function saveRefreshToken(userId: number, token: string): Promise<string> { 
    const query = `INSERT INTO 
                ${REFRESH_TOKEN_TABLE} (user_id, token, expires, created, revoked) 
                VALUES (?, ?, ?, ?, ?)`;
    await db.query<ResultSetHeader>(query, [userId, token, new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), new Date(), null]);
    return token;

}

export async function markRefreshTokenAsUsed(token: string, providedConn?: PoolConnection): Promise<number | null> { 
    const conn = providedConn ?? await db.getConnection();
    const isLocalConnection = !providedConn; 

    try {
        const query = `
            SELECT user_id
            FROM ${REFRESH_TOKEN_TABLE}
            WHERE token = ? AND revoked IS NULL
            LIMIT 1
        `;
        const [rows] = await conn.query<RowDataPacket[]>(query, [token]);
        const foundToken = rows[0];
        if (!foundToken) {
            return null;
        }

        const revokeQuery = `UPDATE ${REFRESH_TOKEN_TABLE} SET revoked = ? WHERE token = ?`;
        await conn.query<ResultSetHeader>(revokeQuery, [new Date(), token]);
        
        return foundToken.user_id;
    } finally {
        if (isLocalConnection) {
            conn.release();
        }
    }
}
