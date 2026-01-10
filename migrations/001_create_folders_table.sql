-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    parent_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_folders_parent FOREIGN KEY (parent_id) REFERENCES public.folders(id) ON DELETE CASCADE,
    
    -- Ensure folder name is not empty
    CONSTRAINT folders_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON public.folders(user_id);

-- Create index on parent_id for faster queries
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);

-- Create index on user_id and parent_id together for common queries
CREATE INDEX IF NOT EXISTS idx_folders_user_parent ON public.folders(user_id, parent_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (if using Supabase Auth)
-- Note: These policies work with Supabase Auth. If using service role key, RLS is bypassed.
-- Users can only see their own folders
CREATE POLICY "Users can view their own folders"
    ON public.folders FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own folders
CREATE POLICY "Users can insert their own folders"
    ON public.folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own folders
CREATE POLICY "Users can update their own folders"
    ON public.folders FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own folders
CREATE POLICY "Users can delete their own folders"
    ON public.folders FOR DELETE
    USING (auth.uid() = user_id);

