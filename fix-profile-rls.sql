-- Fix Profile RLS Policies
-- Run this in Supabase SQL Editor

-- 1. Check if RLS is enabled (should be true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 2. Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- 3. Create policy for users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Create policy for admins to read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role IN ('Super Admin', 'Admin')
  )
);

-- 5. Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 6. Test query (replace with your user_id)
-- SELECT * FROM profiles WHERE user_id = 'your-user-id-here';
