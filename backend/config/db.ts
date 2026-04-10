import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "", // The password you just set in Workbench
    database: "receta_gatimi",
    port: 3306
});



export default pool;