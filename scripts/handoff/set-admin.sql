-- Run this in Supabase SQL Editor to set Nicole as admin.
-- Replace the phone number with Nicole's actual 10-digit number.

UPDATE users
SET user_type = 'admin'
WHERE phone = '2162457316';

-- Verify:
SELECT phone, name, user_type FROM users WHERE user_type = 'admin';
