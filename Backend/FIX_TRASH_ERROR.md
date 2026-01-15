# 🚨 FIX TRASH ERROR - Step by Step

## The Error
```
Error: column folders.is_deleted does not exist
```

## The Solution (Takes 2 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar

### Step 2: Copy This SQL
Copy the ENTIRE block below:

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

### Step 3: Paste and Run
1. Paste the SQL into the SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success" message

### Step 4: Verify
Run this to check if it worked:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'folders' AND column_name = 'is_deleted';
```

You should see `is_deleted` in the results.

### Step 5: Refresh Your App
Go back to your app and refresh the Trash page. The error should be gone!

---

## Still Having Issues?

If you get any errors when running the SQL:
1. Make sure you're in the correct Supabase project
2. Check that the `folders` and `files` tables exist
3. If you see "permission denied", make sure you're using the correct database user

## Quick Test
After running the SQL, you can test if it worked by running this in SQL Editor:

```sql
SELECT 
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'folders' AND column_name = 'is_deleted') as folders_has_column,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'files' AND column_name = 'is_deleted') as files_has_column;
```

Both should return `1` if the columns were added successfully.
