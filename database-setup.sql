-- Database setup for chat functionality
-- Run this in your Supabase SQL editor

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  report_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure participants are different
  CONSTRAINT different_participants CHECK (participant_1 != participant_2),
  
  -- Unique constraint to prevent duplicate conversations between same users
  CONSTRAINT unique_conversation UNIQUE (participant_1, participant_2)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  read_by_recipient BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Function to get or create a conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  user1_id UUID,
  user2_id UUID,
  report_id_param UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  participant_1 UUID,
  participant_2 UUID,
  report_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_message_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_record conversations%ROWTYPE;
BEGIN
  -- Try to find existing conversation (order doesn't matter)
  SELECT * INTO conversation_record
  FROM conversations
  WHERE (participant_1 = user1_id AND participant_2 = user2_id)
     OR (participant_1 = user2_id AND participant_2 = user1_id);
  
  -- If conversation exists, return it
  IF FOUND THEN
    RETURN QUERY SELECT 
      conversation_record.id,
      conversation_record.participant_1,
      conversation_record.participant_2,
      conversation_record.report_id,
      conversation_record.created_at,
      conversation_record.updated_at,
      conversation_record.last_message_at;
    RETURN;
  END IF;
  
  -- Create new conversation
  INSERT INTO conversations (participant_1, participant_2, report_id)
  VALUES (user1_id, user2_id, report_id_param)
  RETURNING * INTO conversation_record;
  
  -- Return the new conversation
  RETURN QUERY SELECT 
    conversation_record.id,
    conversation_record.participant_1,
    conversation_record.participant_2,
    conversation_record.report_id,
    conversation_record.created_at,
    conversation_record.updated_at,
    conversation_record.last_message_at;
END;
$$;

-- Function to update last_message_at when new message is inserted
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update conversation timestamps
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for conversations
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

-- RLS Policies for messages
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

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id::text = auth.uid()::text);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
