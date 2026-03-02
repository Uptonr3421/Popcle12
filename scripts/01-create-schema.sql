-- Pop Culture CLE Loyalty App Database Schema

-- Users table (customers with phone-based auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  stamp_count INT DEFAULT 0 CHECK (stamp_count >= 0 AND stamp_count <= 10),
  loyalty_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Loyalty records (track individual stamp additions)
CREATE TABLE loyalty_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stamp_added_at TIMESTAMP DEFAULT NOW(),
  scanned_by_employee VARCHAR(255),
  notes TEXT
);

-- Offers table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INT,
  free_item BOOLEAN DEFAULT FALSE,
  applicable_items TEXT,
  image_url TEXT,
  geofence_enabled BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_by_admin VARCHAR(255)
);

-- Offer redemptions (track which customers viewed/redeemed)
CREATE TABLE offer_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  redeemed_at TIMESTAMP,
  UNIQUE(user_id, offer_id)
);

-- Geofence triggers (track when customers enter/exit zone)
CREATE TABLE geofence_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entered_at TIMESTAMP DEFAULT NOW(),
  exited_at TIMESTAMP,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
);

-- Create indexes for performance
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_loyalty_records_user ON loyalty_records(user_id);
CREATE INDEX idx_loyalty_records_timestamp ON loyalty_records(stamp_added_at);
CREATE INDEX idx_offer_redemptions_user ON offer_redemptions(user_id);
CREATE INDEX idx_offer_redemptions_offer ON offer_redemptions(offer_id);
CREATE INDEX idx_geofence_triggers_user ON geofence_triggers(user_id);
CREATE INDEX idx_geofence_triggers_timestamp ON geofence_triggers(entered_at);
