# Supabase Authentication Fix

## Issue
After deployment, the chat functionality is failing with authentication errors:
- `401 (Unauthorized)` when trying to access conversations
- `new row violates row-level security policy for table "conversations"`

## Root Cause
The issue is caused by a mismatch between NextAuth.js authentication and Supabase Row Level Security (RLS) policies. The RLS policies expect `auth.uid()` to work, but the custom JWT tokens from NextAuth.js aren't being properly recognized by Supabase.

## Solution

### 1. Update RLS Policies in Supabase
Run the following SQL in your Supabase SQL editor:

```sql
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
```

### 2. Verify Environment Variables
Make sure you have the following environment variables set in your deployment:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

**Important**: The `SUPABASE_JWT_SECRET` must match the JWT secret configured in your Supabase project settings.

### 3. Get Your JWT Secret
To get your JWT secret:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "JWT Secret" value
4. Set it as `SUPABASE_JWT_SECRET` in your environment variables

### 4. Code Changes Made
The following code changes have been made to improve authentication handling:

1. **Updated Supabase client configuration** (`app/_lib/supabaseClient.js`)
   - Improved JWT token handling
   - Better fallback mechanism

2. **Enhanced RLS policies** (`database-setup.sql`)
   - Added support for custom JWT tokens
   - Fallback to `auth.jwt() ->> 'sub'` when `auth.uid()` doesn't work

3. **Improved error handling** (`app/account/chats/hooks/useChatData.js`)
   - Added RLS policy violation detection
   - Better fallback to browser client

4. **Enhanced JWT token generation** (`app/_lib/auth.js`)
   - Added proper JWT claims
   - Better error handling

### 5. Testing
After applying these changes:
1. Redeploy your application
2. Test the chat functionality
3. Check the browser console for any remaining errors

### 6. Alternative Solution (If Issues Persist)
If the above doesn't work, you can temporarily disable RLS for testing:

```sql
-- TEMPORARY: Disable RLS for testing (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

**Note**: Only use this as a temporary measure for debugging. Re-enable RLS once the issue is resolved.

## Files Modified
- `app/_lib/supabaseClient.js`
- `app/_lib/auth.js`
- `app/account/chats/hooks/useChatData.js`
- `database-setup.sql`
- `scripts/update-rls-policies.sql` (new file)