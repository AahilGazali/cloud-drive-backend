# 🚨 FIX DATABASE ERROR - 2 MINUTES

## The Problem
Your database is missing the `is_deleted` column. The app works but shows warnings.

## ✅ SOLUTION (Copy & Paste)

### Step 1: Open Supabase
1. Go to **https://supabase.com/dashboard**
2. Click on **your project**
3. Click **"SQL Editor"** in the left sidebar

### Step 2: Copy This SQL
Copy everything below (from `-- Add` to the end):

```sql
-- Add is_deleted column to folders table
ALTER TABLE public.folders 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add is_deleted column to files table  
ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_is_deleted ON public.folders(is_deleted) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON public.files(is_deleted) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS idx_folders_user_deleted ON public.folders(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_user_deleted ON public.files(user_id, is_deleted);
```

### Step 3: Run It
1. Paste into SQL Editor
2. Click **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success" ✅

### Step 4: Restart Backend
```bash
# Stop your backend (Ctrl+C)
# Then start again
cd Backend
npm run dev
```

### Step 5: Refresh Browser
Refresh your app - all warnings will be gone! 🎉

---

## Why This Happens
The app needs `is_deleted` column for trash functionality. Without it, deleted items can't be moved to trash.

## After Adding Column
- ✅ Trash will work properly
- ✅ Deleted items go to trash (not permanently deleted)
- ✅ You can restore items from trash
- ✅ No more warnings in console
