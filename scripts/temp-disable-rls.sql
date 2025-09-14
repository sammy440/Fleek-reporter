-- TEMPORARY: Disable RLS for testing
-- Run this in your Supabase SQL editor to fix the immediate issue

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE follows DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON conversations TO anon, authenticated;
GRANT ALL ON messages TO anon, authenticated;
GRANT ALL ON reports TO anon, authenticated;
GRANT ALL ON report_likes TO anon, authenticated;
GRANT ALL ON report_comments TO anon, authenticated;
GRANT ALL ON follows TO anon, authenticated;