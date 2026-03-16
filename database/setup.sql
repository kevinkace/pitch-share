-- Pitch Share Database Setup
-- Run this in Supabase SQL Editor

-- 1. Create pitches table
CREATE TABLE pitches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  count INTEGER,
  date DATE,
  time TIME,
  speed DECIMAL(5,2),
  unit VARCHAR(10),
  pitch_view TEXT,
  pitch_zone TEXT,
  pitch_type TEXT,
  player_name TEXT,
  sport TEXT,
  activity TEXT,
  video TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_name TEXT NOT NULL,
  date DATE,
  sport TEXT,
  activity TEXT,
  unit TEXT,
  pitch_count INTEGER,
  fastest_speed DECIMAL(5,2),
  average_speed DECIMAL(5,2),
  csv_file_path TEXT,
  is_private BOOLEAN DEFAULT true, -- Private by default, user can make public
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for performance
-- For user's session listings
CREATE INDEX idx_sessions_user_id_created_at ON sessions(user_id, created_at DESC);

-- For public session browsing
CREATE INDEX idx_sessions_public_created_at ON sessions(is_private, created_at DESC);

-- For user's pitches by session
CREATE INDEX idx_pitches_user_session ON pitches(user_id, session_id);

-- For pitch queries by date
CREATE INDEX idx_pitches_user_id_date ON pitches(user_id, date);

-- 3. Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  website TEXT,
  username_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index for usernames (case-insensitive)
CREATE UNIQUE INDEX idx_profiles_username_lower ON profiles (LOWER(username));

-- Index for username lookup
CREATE INDEX idx_profiles_username ON profiles (username);

-- 4. Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for sessions
-- Users can always view their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view public sessions (including anonymous users)
CREATE POLICY "Anyone can view public sessions" ON sessions
  FOR SELECT USING (is_private = false);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS policies for pitches
-- Users can always view their own pitches
CREATE POLICY "Users can view own pitches" ON pitches
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view pitches from public sessions (including anonymous users)
CREATE POLICY "Anyone can view pitches from public sessions" ON pitches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = pitches.session_id
      AND sessions.is_private = false
    )
  );

-- Users can insert their own pitches
CREATE POLICY "Users can insert own pitches" ON pitches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pitches
CREATE POLICY "Users can update own pitches" ON pitches
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own pitches
CREATE POLICY "Users can delete own pitches" ON pitches
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS policies for profiles
-- Users can view all profiles (for username uniqueness checks and public viewing)
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can delete their own profile (for account deletion)
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- 8. Create storage bucket for CSV files
INSERT INTO storage.buckets (id, name, public)
VALUES ('csv-uploads', 'csv-uploads', false);

-- 9. Create storage policies
-- Allow users to upload their own CSV files
CREATE POLICY "Users can upload own CSV files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own CSV files
CREATE POLICY "Users can read own CSV files" ON storage.objects
  FOR SELECT USING (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);