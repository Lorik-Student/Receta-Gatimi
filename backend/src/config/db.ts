import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
  port: Number(process.env.DB_PORT ?? 3306),
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to the database successfully.');
    conn.release();
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    // Do not throw here to avoid crashing the entire process at module import time.
    // The application will continue to start; DB operations will surface errors when used.
  }
}

// Attempt a non-fatal connection test on startup. Failures are logged but do not stop the server.
testConnection().catch(() => {
  // Already logged inside testConnection; swallow the rejection to avoid unhandled rejection.
});

export default pool;