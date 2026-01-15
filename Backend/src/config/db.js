import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

if (!env.SUPABASE_DB_URL) {
  console.error("❌ SUPABASE_DB_URL not set. Database queries will fail.");
  console.error("Please set SUPABASE_DB_URL in your .env file.");
}

export const pool = new Pool({
  connectionString: env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Add connection timeout and retry settings
  connectionTimeoutMillis: 10000, // 10 seconds
  idleTimeoutMillis: 30000,
  max: 20,
  // Support both direct and pooler connections
  // Pooler uses port 6543, direct uses 5432
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Test connection on startup
if (env.SUPABASE_DB_URL) {
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('✅ Database connection successful');
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
        console.error('   This usually means:');
        console.error('   1. The SUPABASE_DB_URL is incorrect');
        console.error('   2. Your network cannot reach the database');
        console.error('   3. The database hostname is invalid');
      } else if (err.message.includes('password authentication failed') || err.message.includes('authentication failed')) {
        console.error('   This means:');
        console.error('   1. The password in SUPABASE_DB_URL is incorrect');
        console.error('   2. Go to Supabase Dashboard → Settings → Database');
        console.error('   3. Click "Database Settings" to reset your password');
        console.error('   4. Update SUPABASE_DB_URL in Backend/.env with the correct password');
      }
    });
}

export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    // Enhance error messages for common connection issues
    if (error.message && (
      error.message.includes('ENOTFOUND') || 
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('getaddrinfo')
    )) {
      const enhancedError = new Error(`Database connection failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.code = error.code;
      throw enhancedError;
    }
    throw error;
  }
};

