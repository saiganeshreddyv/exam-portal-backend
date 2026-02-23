import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: `${process.env.DB_USER}`.trim(),
  host: `${process.env.DB_HOST}`.trim(),
  database: `${process.env.DB_NAME}`.trim(),
  password: `${process.env.DB_PASSWORD}`.trim(),
  port: Number(process.env.DB_PORT),
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => {
    console.error("❌ PostgreSQL connection error", err);
  });

export default pool;
