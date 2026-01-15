# 🚨 URGENT FIX REQUIRED

## Current Errors
- ❌ 400 Bad Request on `/api/folders?parentId=null`
- ❌ 500 Internal Server Error on `/api/trash`

## Root Cause
The database tables are missing the `is_deleted` column.

## ✅ QUICK FIX (2 minutes)

### Step 1: Open Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in left sidebar

### Step 2: Run This SQL
Copy and paste this ENTIRE block:

```sql
ALTER TABLE public.folders 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

CREATE INDEX IF NOT EXISTS idx_folders_is_deleted ON public.folders(is_deleted) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON public.files(is_deleted) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS idx_folders_user_deleted ON public.folders(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_user_deleted ON public.files(user_id, is_deleted);
```

### Step 3: Click "Run"
Wait for "Success" message.

### Step 4: Restart Backend
```bash
cd Backend
# Stop the server (Ctrl+C)
npm run dev
```

### Step 5: Refresh Frontend
Refresh your browser. All errors should be gone! ✅

---

## What I Fixed in Code
- ✅ Added graceful fallback for missing `is_deleted` column
- ✅ Improved error handling in folders and trash endpoints
- ✅ Added error handling middleware

But you **MUST** add the database column for full functionality!
