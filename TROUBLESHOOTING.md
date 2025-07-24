# Meal Planning Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to create meal plan" Error

#### Possible Causes:
- **Authentication Issue**: User not properly authenticated
- **Database Permissions**: RLS (Row Level Security) blocking the insert
- **Missing User Profile**: User profile doesn't exist
- **Database Schema**: Table structure issues

#### Debugging Steps:

1. **Check Browser Console**
   - Open browser developer tools (F12)
   - Look for error messages in the Console tab
   - Check for authentication errors

2. **Use Debug Button**
   - Click the "Debug" button on the meal planning page
   - Check console for user and profile information
   - Verify user authentication status

3. **Check Database Schema**
   - Run the test script in Supabase SQL editor:
   ```sql
   -- Check if table exists
   SELECT EXISTS (
       SELECT FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name = 'meal_plans'
   );
   ```

4. **Verify RLS Policies**
   - Run this query in Supabase SQL editor:
   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual, with_check
   FROM pg_policies 
   WHERE tablename = 'meal_plans';
   ```

5. **Check User Profile**
   - Ensure user profile exists in `user_profiles` table
   - Verify user ID matches between auth and profile tables

#### Solutions:

1. **If Authentication Issue**:
   - Log out and log back in
   - Clear browser cache and cookies
   - Check Supabase authentication settings

2. **If RLS Policy Issue**:
   - Ensure user is authenticated
   - Check that user ID matches the policy conditions
   - Verify RLS is properly configured

3. **If Missing User Profile**:
   - The system should auto-create profiles, but you can manually create one:
   ```sql
   INSERT INTO user_profiles (id, email)
   VALUES ('your-user-id', 'your-email@example.com');
   ```

4. **If Database Schema Issue**:
   - Run the schema.sql file in Supabase SQL editor
   - Ensure all tables and policies are created correctly

### 2. "Permission denied" Error

This usually indicates an RLS policy issue.

#### Solution:
1. Check if user is properly authenticated
2. Verify user ID in the request matches the authenticated user
3. Ensure RLS policies are correctly configured

### 3. "User profile error" Message

#### Solution:
1. Check if user profile exists in database
2. Verify user authentication
3. Try refreshing the page or logging out/in

### 4. Calendar Not Showing Meals

#### Possible Causes:
- No meal plan selected
- No meals added to the plan
- Date selection issue

#### Solution:
1. Create a meal plan first
2. Add meals to specific dates
3. Click on dates in the calendar to view meals

## Debug Information

### Console Logs to Check:
- "Loading user data..."
- "User authenticated: [user-id]"
- "Loading user profile..."
- "Profile data: [data] Profile error: [error]"
- "Loading meal plans..."
- "Meal plans data: [data] Meal plans error: [error]"

### Database Queries to Test:

1. **Check User Authentication**:
   ```sql
   SELECT auth.uid() as current_user_id;
   ```

2. **Check User Profile**:
   ```sql
   SELECT * FROM user_profiles WHERE id = auth.uid();
   ```

3. **Check Meal Plans**:
   ```sql
   SELECT * FROM meal_plans WHERE user_id = auth.uid();
   ```

4. **Test Insert (replace with actual user ID)**:
   ```sql
   INSERT INTO meal_plans (user_id, name, description, start_date, end_date, is_active)
   VALUES ('your-user-id', 'Test Plan', 'Test', '2024-01-01', '2024-01-07', true);
   ```

## Environment Variables

Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contact Support

If issues persist:
1. Check browser console for detailed error messages
2. Verify Supabase project settings
3. Test database connection
4. Check RLS policies configuration 