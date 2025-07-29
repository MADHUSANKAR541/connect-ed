-- Profile Views Migration
-- Run this script to add profile views tracking functionality

-- Add profile_views column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Create a function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE users 
    SET profile_views = COALESCE(profile_views, 0) + 1
    WHERE id = user_id
    RETURNING profile_views INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create a profile_views_log table for detailed tracking (optional)
CREATE TABLE IF NOT EXISTS profile_views_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_views_log_viewed_user_id ON profile_views_log(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_log_viewed_at ON profile_views_log(viewed_at);
CREATE INDEX IF NOT EXISTS idx_users_profile_views ON users(profile_views);

-- Add comments
COMMENT ON COLUMN users.profile_views IS 'Number of times this user profile has been viewed';
COMMENT ON TABLE profile_views_log IS 'Detailed log of profile views for analytics';
COMMENT ON COLUMN profile_views_log.viewer_id IS 'ID of the user who viewed the profile';
COMMENT ON COLUMN profile_views_log.viewed_user_id IS 'ID of the user whose profile was viewed';

-- Enable RLS on profile_views_log
ALTER TABLE profile_views_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_views_log
DROP POLICY IF EXISTS profile_views_log_select_policy ON profile_views_log;
DROP POLICY IF EXISTS profile_views_log_insert_policy ON profile_views_log;

-- Allow users to view their own profile view logs
CREATE POLICY profile_views_log_select_policy ON profile_views_log
    FOR SELECT USING (auth.uid() = viewed_user_id);

-- Allow authenticated users to insert profile view logs
CREATE POLICY profile_views_log_insert_policy ON profile_views_log
    FOR INSERT WITH CHECK (auth.uid() = viewer_id); 