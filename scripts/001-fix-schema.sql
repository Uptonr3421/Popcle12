-- Fix database schema to match application code

-- Rename phone_number to phone in users table
ALTER TABLE users RENAME COLUMN phone_number TO phone;

-- Add user_type column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'customer';

-- Fix loyalty_records to have correct column names for the API
ALTER TABLE loyalty_records ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES users(id);
ALTER TABLE loyalty_records ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES users(id);
ALTER TABLE loyalty_records ADD COLUMN IF NOT EXISTS action VARCHAR(50);

-- Create index for faster phone lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Create index for faster user_type lookups
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
