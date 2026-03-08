-- ============================================================
-- Pop Culture CLE Loyalty App — Complete Database Schema
-- Run this ONCE in a new Supabase project's SQL Editor
-- ============================================================

-- 1. USERS — customers, employees, and admins
CREATE TABLE IF NOT EXISTS users (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  phone text UNIQUE NOT NULL,
  name text,
  user_type text NOT NULL DEFAULT 'customer'
    CHECK (user_type IN ('customer', 'employee', 'admin')),
  stamp_count integer DEFAULT 0,
  expo_push_token text,
  auth_id uuid,
  created_at timestamptz DEFAULT now()
);

-- 2. LOYALTY RECORDS — stamp additions and reward claims
CREATE TABLE IF NOT EXISTS loyalty_records (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id bigint REFERENCES users(id),
  customer_id bigint REFERENCES users(id),
  employee_id bigint REFERENCES users(id),
  action text NOT NULL CHECK (action IN ('stamp_added', 'reward_claimed')),
  stamp_added_at timestamptz DEFAULT now(),
  deal_id uuid
);

-- 3. OFFERS — deals, specials, geofenced promotions
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  discount_percentage integer,
  free_item boolean DEFAULT false,
  discount_label text,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  active boolean DEFAULT true,
  geofence_enabled boolean DEFAULT false,
  lat float8,
  lng float8,
  radius_meters integer DEFAULT 200,
  created_at timestamptz DEFAULT now()
);

-- 4. SCHEDULED PUSH NOTIFICATIONS
CREATE TABLE IF NOT EXISTS scheduled_pushes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  sent boolean DEFAULT false,
  sent_at timestamptz,
  recipient_type text NOT NULL DEFAULT 'all'
    CHECK (recipient_type IN ('all', 'nearby')),
  created_at timestamptz DEFAULT now()
);

-- 5. GEOFENCE EVENTS — analytics for location-triggered pushes
CREATE TABLE IF NOT EXISTS geofence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  special_id uuid,
  triggered_at timestamptz DEFAULT now(),
  push_sent boolean DEFAULT false
);

-- 6. ROW LEVEL SECURITY (basic policies)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_pushes ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users read own" ON users FOR SELECT
  USING (true);  -- Open read for now; tighten in production

-- Anyone can read active offers
CREATE POLICY "Read active offers" ON offers FOR SELECT
  USING (active = true);

-- Admin can manage everything (using service role key bypasses RLS anyway)
-- For production, add proper policies based on auth.uid()

-- ============================================================
-- DONE! Now go to Authentication > Providers > Phone
-- and configure Twilio (see setup-guide.md)
-- ============================================================
