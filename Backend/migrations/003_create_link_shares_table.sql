-- Create link_shares table for public sharing links
CREATE TABLE IF NOT EXISTS public.link_shares (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('file', 'folder')),
    resource_id INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for faster queries
    CONSTRAINT link_shares_token_unique UNIQUE (token)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_link_shares_token ON public.link_shares(token);
CREATE INDEX IF NOT EXISTS idx_link_shares_resource ON public.link_shares(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_link_shares_created_by ON public.link_shares(created_by);
CREATE INDEX IF NOT EXISTS idx_link_shares_expires_at ON public.link_shares(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE public.link_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Anyone can view non-expired links (for public access)
CREATE POLICY "Anyone can view non-expired links"
    ON public.link_shares FOR SELECT
    USING (expires_at IS NULL OR expires_at > NOW());

-- Users can create their own links
CREATE POLICY "Users can create their own links"
    ON public.link_shares FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Users can delete their own links
CREATE POLICY "Users can delete their own links"
    ON public.link_shares FOR DELETE
    USING (auth.uid() = created_by);
