# Database Migration Instructions

## Problem
The `folders` and `files` tables are missing the `is_deleted` column, which is required for the trash functionality.

## Solution: Add is_deleted Column

### Option 1: Run SQL directly in Supabase Dashboard (RECOMMENDED)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL:

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

4. Click **Run** to execute the SQL

### Option 2: Run migration script

```bash
cd Backend
npm run migrate
```

**Note:** Make sure your `.env` file has `SUPABASE_DB_URL` configured correctly.

## Verification

After running the migration, verify the columns were added:

```sql
-- Check folders table
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'folders' AND column_name = 'is_deleted';

-- Check files table
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'files' AND column_name = 'is_deleted';
```

Both queries should return a row with `is_deleted` column.
