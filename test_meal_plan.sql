-- Test script for meal_plans table
-- Run this in your Supabase SQL editor to test the table structure

-- 1. Check if the table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'meal_plans'
) as table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'meal_plans'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'meal_plans';

-- 4. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'meal_plans';

-- 5. Test insert (replace 'your-user-id' with actual user ID)
-- INSERT INTO meal_plans (user_id, name, description, start_date, end_date, is_active)
-- VALUES ('your-user-id', 'Test Plan', 'Test Description', '2024-01-01', '2024-01-07', true);

-- 6. Check existing meal plans
SELECT * FROM meal_plans LIMIT 5; 