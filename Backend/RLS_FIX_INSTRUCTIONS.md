# Fix Row Level Security (RLS) Error for File Uploads

## Problem
Error: "new row violates row-level security policy"

This error occurs when Supabase RLS (Row Level Security) is blocking file uploads.

## Solution

### Step 1: Verify Service Role Key is Set

1. Open your Supabase Dashboard
2. Go to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Make sure it's set in your Backend `.env` file:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**: The service_role key should be a long JWT token (starts with `eyJ`). It's different from the anon key.

### Step 2: Run SQL to Fix RLS Policies

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `FIX_RLS_POLICIES.sql`
4. Click **Run**

This will:
- Create policies that allow service role to bypass RLS
- Create policies for authenticated users to manage their own files

### Step 3: Alternative - Disable RLS (Development Only)

If you're in development and want to quickly test, you can temporarily disable RLS:

```sql
ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING**: Only do this in development! Never disable RLS in production.

### Step 4: Restart Backend Server

After making changes, restart your backend server:

```bash
cd Backend
npm start
```

## Verification

After applying the fix, try uploading a file again. The upload should work without the RLS error.

## Still Having Issues?

1. Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly in `.env`
2. Verify the service role key in Supabase Dashboard matches your `.env` file
3. Check backend console logs for any Supabase connection errors
4. Ensure the `files` table exists and has the correct columns
