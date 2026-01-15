-- ============================================
-- FIX RLS POLICIES FOR FILE UPLOADS
-- Copy this entire file and paste into Supabase SQL Editor
-- ============================================

-- IMPORTANT: Service role key should bypass RLS, but if you're getting RLS errors,
-- it means either:
-- 1. Service role key is not set correctly in backend .env
-- 2. RLS policies need to be configured

-- Option 1: Disable RLS (NOT RECOMMENDED for production, but works for development)
-- Uncomment the lines below if you want to disable RLS temporarily:
-- ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.folders DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies (RECOMMENDED)
-- Enable RLS on files table
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own files" ON public.files;
DROP POLICY IF EXISTS "Users can view their own files" ON public.files;
DROP POLICY IF EXISTS "Users can update their own files" ON public.files;
DROP POLICY IF EXISTS "Users can delete their own files" ON public.files;
DROP POLICY IF EXISTS "Service role bypass" ON public.files;

-- Policy: Allow service role to bypass RLS (for backend operations)
CREATE POLICY "Service role bypass"
ON public.files
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to INSERT their own files
-- Note: This uses auth.uid() which requires Supabase Auth
-- If using custom JWT, you may need to adjust this
CREATE POLICY "Users can insert their own files"
ON public.files
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Allow authenticated users to SELECT their own files
CREATE POLICY "Users can view their own files"
ON public.files
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Policy: Allow authenticated users to UPDATE their own files
CREATE POLICY "Users can update their own files"
ON public.files
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Allow authenticated users to DELETE their own files
CREATE POLICY "Users can delete their own files"
ON public.files
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Also fix folders table RLS policies
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can view their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can update their own folders" ON public.folders;
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;
DROP POLICY IF EXISTS "Service role bypass folders" ON public.folders;

CREATE POLICY "Service role bypass folders"
ON public.folders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can insert their own folders"
ON public.folders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own folders"
ON public.folders
FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own folders"
ON public.folders
FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own folders"
ON public.folders
FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('files', 'folders')
ORDER BY tablename, policyname;
