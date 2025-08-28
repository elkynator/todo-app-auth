-- Update Todo App for User Authentication
-- Run this SQL in your Supabase dashboard > SQL Editor

-- First, remove the anonymous access policy
DROP POLICY IF EXISTS "Allow anonymous access" ON todos;

-- Create user-specific policies
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE USING (auth.uid() = user_id);

-- Optional: Clear existing todos (comment out if you want to keep existing data)
-- DELETE FROM todos WHERE user_id IS NULL;
