import type { ResultSetHeader, RowDataPacket, QueryResult } from "mysql2";
import bcrypt from "bcrypt";
import db from "../config/db.js"

type Id = number & { __brand: "Id"};

export interface User {
    id: Id;                    
    first_name: string;                  
    last_name: string;               
    email: string;                 
    password: string;         
    phone_number: string | null;   
    email_confirmed: boolean;      
    lockout_enabled: boolean;      
    access_failed_count: number;   
    creation_date: Date;           
    status: string;               
}

export type UserInsert = Omit<User, "id" | "creation_date"> & {
    phone_number?: string | null;
    email_confirmed?: boolean;
    lockout_enabled?: boolean;
    access_failed_count?: number;
    status?: string;
}

export type UserUpdate = Partial<Omit<User, 'id'>>;
type UserRow = User & RowDataPacket;

export const TABLENAME = "users";

export async function insert(user: UserInsert): Promise<Id> {
    const query = `INSERT INTO ${TABLENAME} 
        (emri, mbiemri, email, password_hash, phone_number,
        email_confirmed, lockout_enabled, access_failed_count, data_krijimit, statusi)
        VALUES (?,?,?,?,?,?,?,?,?,?)`;

    const passwordHash = await bcrypt.hash(user.password, 10);
    const creationDate = new Date();
    const [result] = await db.query<ResultSetHeader>(query, [
        user.first_name,
        user.last_name,
        user.email,
        passwordHash,
        user.phone_number ?? null,
        user.email_confirmed,
        user.lockout_enabled,
        user.access_failed_count,
        creationDate,
        user.status
    ]);

    return result.insertId as Id;
}

export async function find(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${TABLENAME} WHERE email = ? LIMIT 1`;
    const [rows] = await db.query<UserRow[]>(query, [email]);
    return rows[0] || null;
}

export async function findAll(): Promise<User[]> {
    const query = `SELECT * FROM ${TABLENAME}`;
    const [rows] = await db.query<UserRow[]>(query);
    return rows;
}

export async function update(id: Id, data: UserUpdate): Promise<void> {
    const entries = Object.entries(data);
    if (!entries.length) return;

    const setClause = entries.map(([key]) => `${key} = ?`).join(", ");
    const values = entries.map(([, value]) => value);

    const query = `UPDATE ${TABLENAME} SET ${setClause} WHERE id = ?`;
    await db.query<ResultSetHeader>(query, [...values, id]);
}