-- Update RLS policies to work with custom JWT tokens
-- Run this in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations they participate in" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in conversations they participate in" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in conversations they participate in" ON messages;

-- Create updated policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    auth.uid()::text = participant_1::text OR 
    auth.uid()::text = participant_2::text OR
    auth.jwt() ->> 'sub' = participant_1::text OR
    auth.jwt() ->> 'sub' = participant_2::text
  );

CREATE POLICY "Users can insert conversations they participate in" ON conversations
  FOR INSERT WITH CHECK (
    auth.uid()::text = participant_1::text OR 
    auth.uid()::text = participant_2::text OR
    auth.jwt() ->> 'sub' = participant_1::text OR
    auth.jwt() ->> 'sub' = participant_2::text
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
        participant_2::text = auth.jwt() ->> 'sub'
      )
    )
  );

CREATE POLICY "Users can insert messages in conversations they participate in" ON messages
  FOR INSERT WITH CHECK (
    (sender_id::text = auth.uid()::text OR sender_id::text = auth.jwt() ->> 'sub') AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = messages.conversation_id 
      AND (
        participant_1::text = auth.uid()::text OR 
        participant_2::text = auth.uid()::text OR
        participant_1::text = auth.jwt() ->> 'sub' OR
        participant_2::text = auth.jwt() ->> 'sub'
      )
    )
  );

-- Update the update policy for messages as well
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    sender_id::text = auth.uid()::text OR 
    sender_id::text = auth.jwt() ->> 'sub'
  );