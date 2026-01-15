# Database Connection Setup Guide

## ⚠️ Important: IPv4 Compatibility Issue

Your Supabase project shows a warning: **"Not IPv4 compatible"**. This means the direct connection (`db.nkpcdutkswbxrauqjsmf.supabase.co:5432`) won't work on IPv4-only networks.

## ✅ Solution: Use Session Pooler

You need to use the **Session Pooler** connection string instead of the direct connection.

### Steps to Get Session Pooler Connection String:

1. **Go to Supabase Dashboard** → Your Project → **Settings** → **Database**
2. **Click on "Connection String" tab**
3. **Change the "Method" dropdown** from "Direct connection" to **"Session pooler"**
4. **Copy the connection string** - it will look like:
   ```
   postgresql://postgres.nkpcdutkswbxrauqjsmf:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres.nkpcdutkswbxrauqjsmf:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

### Update Your .env File:

1. Open `Backend/.env`
2. Find `SUPABASE_DB_URL`
3. Replace it with the **Session Pooler** connection string
4. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
   - If you don't know your password, click "Reset your database password" in Supabase dashboard

### Example .env Entry:

```env
SUPABASE_DB_URL=postgresql://postgres.nkpcdutkswbxrauqjsmf:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### After Updating:

1. Save the `.env` file
2. Restart your backend server
3. Run `npm run check-db` to verify the connection works

## 🔍 Verify Connection:

```bash
cd Backend
npm run check-db
```

You should see: ✅ Database connection successful!

## 📝 Notes:

- **Session Pooler** uses port **6543** (or sometimes 5432)
- **Direct connection** uses port **5432** (but won't work on IPv4)
- The pooler connection string has a different hostname format
- Make sure to URL-encode your password if it contains special characters
