import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import db from "../../config/db.js"
import type { Id } from "../../common/types/index.js";
import type { RefreshToken } from "../../common/types/auth.types.js";

const REFRESH_TOKEN_TABLE = "refreshtokens";
const USER_TOKEN_TABLE = "usertokens";

export async function findRefreshToken(token: string): Promise<RefreshToken | null> { 
    const query = `SELECT * FROM ${REFRESH_TOKEN_TABLE} WHERE token = ? LIMIT 1`;
    const [rows] = await db.query<RowDataPacket[]>(query, [token]);
    return rows.length ? rows[0] as RefreshToken : null;
}

export async function saveRefreshToken(userId: Id, token: string): Promise<string> { 
    const query = `INSERT INTO 
                ${REFRESH_TOKEN_TABLE} (user_id, token, expires, created, revoked) 
                VALUES (?, ?, ?, ?, ?)`;
    await db.query<ResultSetHeader>(query, [userId, token, new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), new Date(), null]);
    return token;

}

export async function markRefreshTokenAsUsed(token: string, providedConn?: PoolConnection): Promise<Id | null> { 
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
        
        return foundToken.user_id as Id;
    } finally {
        if (isLocalConnection) {
            conn.release();
        }
    }
}
export async function findUserToken(
    userId: Id,
    loginProvider: string,
    tokenName: string
): Promise<{ id: Id; token_value: string } | null> {
    const query = `
        SELECT id, token_value
        FROM ${USER_TOKEN_TABLE}
        WHERE user_id = ? AND login_provider = ? AND token_name = ?
        LIMIT 1
    `;

    const [rows] = await db.query<RowDataPacket[]>(query, [userId, loginProvider, tokenName]);
    return rows.length ? (rows[0] as { id: Id; token_value: string }) : null;
}

export async function upsertUserToken(
    userId: Id,
    loginProvider: string,
    tokenName: string,
    tokenValue: string
): Promise<void> {
    const existing = await findUserToken(userId, loginProvider, tokenName);

    if (existing) {
        const updateQuery = `
            UPDATE ${USER_TOKEN_TABLE}
            SET token_value = ?
            WHERE id = ?
        `;
        await db.query<ResultSetHeader>(updateQuery, [tokenValue, existing.id]);
        return;
    }

    const insertQuery = `
        INSERT INTO ${USER_TOKEN_TABLE} (user_id, login_provider, token_name, token_value)
        VALUES (?, ?, ?, ?)
    `;
    await db.query<ResultSetHeader>(insertQuery, [userId, loginProvider, tokenName, tokenValue]);
}



// export async function updateRefreshToken(token: string, newToken: string): Promise<RefreshToken | null> {
//     const connection = await db.getConnection();
//     try {
//         await connection.beginTransaction();
//         const userId = await markRefreshTokenAsUsed(connection , token);
//         if (!userId) {
//             throw new Error("Invalid refresh token");
//         }
//         await saveRefreshToken(userId, newToken);
//         await connection.commit();
//         return await findRefreshToken(newToken);
//     } catch (error) {
//         await connection.rollback();
//         throw error;
//     } finally {
//         connection.release();
//     }
// }

