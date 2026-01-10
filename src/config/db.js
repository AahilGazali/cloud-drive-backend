import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

if (!env.SUPABASE_DB_URL) {
  console.warn("SUPABASE_DB_URL not set. Database queries will fail.");
}

export const pool = new Pool({
  connectionString: env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const query = (text, params) => pool.query(text, params);

