-- Add is_deleted column to folders table
ALTER TABLE public.folders 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add is_deleted column to files table (if it exists)
ALTER TABLE public.files 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index on is_deleted for faster queries
CREATE INDEX IF NOT EXISTS idx_folders_is_deleted ON public.folders(is_deleted) WHERE is_deleted = true;
CREATE INDEX IF NOT EXISTS idx_files_is_deleted ON public.files(is_deleted) WHERE is_deleted = true;

-- Create index on user_id and is_deleted together for trash queries
CREATE INDEX IF NOT EXISTS idx_folders_user_deleted ON public.folders(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_files_user_deleted ON public.files(user_id, is_deleted);
