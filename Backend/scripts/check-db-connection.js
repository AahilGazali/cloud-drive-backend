/**
 * Script to check database connection
 * Run with: node scripts/check-db-connection.js
 */

import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: "./.env" });

const { Pool } = pg;

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;

console.log("🔍 Checking database configuration...\n");

if (!SUPABASE_DB_URL) {
  console.error("❌ SUPABASE_DB_URL is not set in your .env file!");
  console.error("\nPlease add SUPABASE_DB_URL to Backend/.env file.");
  console.error("\nTo get your connection string:");
  console.error("1. Go to your Supabase project dashboard");
  console.error("2. Navigate to Settings → Database");
  console.error("3. Copy the 'Connection string' (URI format)");
  console.error("4. Replace [YOUR-PASSWORD] with your database password");
  console.error("\nFormat: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres");
  process.exit(1);
}

console.log("✅ SUPABASE_DB_URL is set");
console.log("📋 Connection string format:", SUPABASE_DB_URL.replace(/:[^:@]+@/, ":****@") + "\n");

// Parse the connection string to check format
try {
  const url = new URL(SUPABASE_DB_URL);
  console.log("📊 Connection details:");
  console.log("   Protocol:", url.protocol);
  console.log("   Hostname:", url.hostname);
  console.log("   Port:", url.port || "5432 (default)");
  console.log("   Database:", url.pathname || "/postgres");
  console.log("   Username:", url.username || "postgres");
  console.log("   Password:", url.password ? "***" : "❌ NOT SET");
  
  if (!url.password) {
    console.error("\n❌ Password is missing from connection string!");
    console.error("Make sure your SUPABASE_DB_URL includes the password.");
    process.exit(1);
  }
  
  if (!url.hostname || (!url.hostname.includes('supabase.co') && !url.hostname.includes('pooler.supabase.com'))) {
    console.warn("\n⚠️  Hostname doesn't look like a Supabase URL");
    console.warn("Expected formats:");
    console.warn("  - Direct: db.[PROJECT-REF].supabase.co");
    console.warn("  - Pooler: aws-0-[REGION].pooler.supabase.com");
  }
  
  // Check if using direct connection (might have IPv4 issues)
  if (url.hostname && url.hostname.includes('db.') && url.hostname.includes('.supabase.co') && !url.hostname.includes('pooler')) {
    console.warn("\n⚠️  WARNING: You're using Direct connection which may not work on IPv4 networks!");
    console.warn("   Consider switching to 'Session pooler' in Supabase dashboard:");
    console.warn("   Settings → Database → Connection String → Method: Session pooler");
  }
} catch (error) {
  console.error("\n❌ Invalid connection string format!");
  console.error("Error:", error.message);
  console.error("\nExpected format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres");
  process.exit(1);
}

console.log("\n🔌 Testing database connection...\n");

const pool = new Pool({
  connectionString: SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

pool.query('SELECT NOW() as current_time, version() as db_version')
  .then((result) => {
    console.log("✅ Database connection successful!");
    console.log("   Current time:", result.rows[0].current_time);
    console.log("   Database version:", result.rows[0].db_version.split('\n')[0]);
    console.log("\n🎉 Your database connection is working correctly!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Database connection failed!");
    console.error("   Error:", err.message);
    
    if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error("\n🔍 DNS Resolution Error - This means:");
      console.error("   1. The hostname in SUPABASE_DB_URL cannot be resolved");
      console.error("   2. Check if the hostname is correct: db.[PROJECT-REF].supabase.co");
      console.error("   3. Verify your internet connection");
      console.error("   4. Try accessing your Supabase dashboard to verify the project exists");
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error("\n🔍 Connection Refused - This means:");
      console.error("   1. The database server is not accepting connections");
      console.error("   2. Check if your Supabase project is active (not paused)");
      console.error("   3. Verify the port number (should be 5432)");
    } else if (err.message.includes('password authentication')) {
      console.error("\n🔍 Authentication Error - This means:");
      console.error("   1. The password in SUPABASE_DB_URL is incorrect");
      console.error("   2. Get the correct password from Supabase dashboard → Settings → Database");
    } else {
      console.error("\n🔍 Other Error - Check the error message above for details");
    }
    
    process.exit(1);
  });
