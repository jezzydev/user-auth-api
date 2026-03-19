import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

pool.on("connect", () => {
    console.log("Connected to PostgreSQL database.");
});

pool.on("error", (err, client) => {
    console.log("Unexpected database error:", err);
    process.exit(1);
});

export async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Databse connection test successful:", result.rows[0]);
    } catch (error) {
        console.log("Database connection test failed:", error);
        throw error;
    }
}

export default pool;
