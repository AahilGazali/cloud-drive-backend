-- ============================================
-- QUICK FIX: Add is_deleted columns
-- Copy this entire file and paste into Supabase SQL Editor
-- ============================================

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

-- Verify the columns were added
SELECT 
  'folders' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'folders' AND column_name = 'is_deleted'
    ) THEN '✅ Column added successfully'
    ELSE '❌ Column NOT found'
  END as status
UNION ALL
SELECT 
  'files' as table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'files' AND column_name = 'is_deleted'
    ) THEN '✅ Column added successfully'
    ELSE '❌ Column NOT found'
  END as status;
