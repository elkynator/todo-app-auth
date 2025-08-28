-- Supabase Todo App Database Schema
-- Run this SQL in your Supabase dashboard > SQL Editor

-- Create todos table
CREATE TABLE todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL CHECK (char_length(text) > 0 AND char_length(text) <= 200),
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Users can only see and modify their own todos
CREATE POLICY "Users can view their own todos" ON todos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" ON todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX todos_user_id_idx ON todos(user_id);
CREATE INDEX todos_created_at_idx ON todos(created_at DESC);
CREATE INDEX todos_completed_idx ON todos(completed);

-- Insert some sample data (optional - remove user_id line for anonymous usage)
-- INSERT INTO todos (text, completed, user_id) VALUES 
--     ('Welcome to your Supabase Todo App!', false, auth.uid()),
--     ('Try editing this task', false, auth.uid()),
--     ('Mark this as complete', false, auth.uid());
