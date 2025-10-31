-- Fix for Seed Data: Temporarily adjust profiles table for testing
-- Run this BEFORE running seed-data.sql

-- Step 1: Drop the foreign key constraint temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Make id a regular UUID column (not a foreign key)
-- This allows us to insert test data without auth users

-- Note: In production, you'd create real auth users via Supabase Auth
-- For MVP testing, we'll just insert profiles directly

SELECT 'Profiles table updated for testing. Now run seed-data.sql' as status;
