-- Update RLS policies to work with custom headers and JWT tokens
-- Run this in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in conversations they participate in" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in conversations they participate in" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create updated policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    auth.uid()::text = participant_1::text OR 
    auth.uid()::text = participant_2::text OR
    auth.jwt() ->> 'sub' = participant_1::text OR
    auth.jwt() ->> 'sub' = participant_2::text OR
    current_setting('request.headers.x-user-id', true) = participant_1::text OR
    current_setting('request.headers.x-user-id', true) = participant_2::text
  );

CREATE POLICY "Users can insert conversations they participate in" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid()::text = participant_1::text OR 
    auth.uid()::text = participant_2::text OR
    auth.jwt() ->> 'sub' = participant_1::text OR
    auth.jwt() ->> 'sub' = participant_2::text OR
    current_setting('request.headers.x-user-id', true) = participant_1::text OR
    current_setting('request.headers.x-user-id', true) = participant_2::text
  );

-- Create updated policies for messages
CREATE POLICY "Users can view messages in conversations they participate in" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (
        participant_1::text = auth.uid()::text OR 
        participant_2::text = auth.uid()::text OR
        participant_1::text = auth.jwt() ->> 'sub' OR
        participant_2::text = auth.jwt() ->> 'sub' OR
        participant_1::text = current_setting('request.headers.x-user-id', true) OR
        participant_2::text = current_setting('request.headers.x-user-id', true)
      )
    )
  );

CREATE POLICY "Users can insert messages in conversations they participate in" ON messages
  FOR INSERT WITH CHECK (
    (sender_id::text = auth.uid()::text OR 
     sender_id::text = auth.jwt() ->> 'sub' OR
     sender_id::text = current_setting('request.headers.x-user-id', true)) AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (
        participant_1::text = auth.uid()::text OR 
        participant_2::text = auth.uid()::text OR
        participant_1::text = auth.jwt() ->> 'sub' OR
        participant_2::text = auth.jwt() ->> 'sub' OR
        participant_1::text = current_setting('request.headers.x-user-id', true) OR
        participant_2::text = current_setting('request.headers.x-user-id', true)
      )
    )
  );

-- Update the update policy for messages as well
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    sender_id::text = auth.uid()::text OR 
    sender_id::text = auth.jwt() ->> 'sub' OR
    sender_id::text = current_setting('request.headers.x-user-id', true)
  );

-- Also update profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (
    auth.uid()::text = id::text OR
    auth.jwt() ->> 'sub' = id::text OR
    current_setting('request.headers.x-user-id', true) = id::text
  );

-- Update reports policies
DROP POLICY IF EXISTS "Users can view all reports" ON reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;

CREATE POLICY "Users can view all reports" ON reports
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reports" ON reports
  FOR INSERT WITH CHECK (
    user_id::text = auth.uid()::text OR
    user_id::text = auth.jwt() ->> 'sub' OR
    user_id::text = current_setting('request.headers.x-user-id', true)
  );

CREATE POLICY "Users can update their own reports" ON reports
  FOR UPDATE USING (
    user_id::text = auth.uid()::text OR
    user_id::text = auth.jwt() ->> 'sub' OR
    user_id::text = current_setting('request.headers.x-user-id', true)
  );

CREATE POLICY "Users can delete their own reports" ON reports
  FOR DELETE USING (
    user_id::text = auth.uid()::text OR
    user_id::text = auth.jwt() ->> 'sub' OR
    user_id::text = current_setting('request.headers.x-user-id', true)
  );