-- Multi-User Twilio Platform Database Migration
-- This file contains the SQL commands to transform your database for multi-user support

-- ==== STEP 1: Create user_phone_numbers table ====
CREATE TABLE user_phone_numbers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  twilio_sid VARCHAR(255) UNIQUE NOT NULL,
  website_id INT NULL, -- Optional association with websites
  provider VARCHAR(50) DEFAULT 'twilio',
  monthly_fee DECIMAL(10, 2) DEFAULT 1.00,
  call_count INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  country VARCHAR(3) DEFAULT 'US',
  region VARCHAR(100) NULL,
  locality VARCHAR(100) NULL,
  capabilities_voice BOOLEAN DEFAULT TRUE,
  capabilities_sms BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_phone_number (phone_number),
  INDEX idx_twilio_sid (twilio_sid),
  INDEX idx_status (status)
);

-- ==== STEP 2: Create twilio_calls table ====
CREATE TABLE twilio_calls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  call_sid VARCHAR(255) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  phone_number_id INT NOT NULL,
  to_number VARCHAR(20) NOT NULL,
  from_number VARCHAR(20) NOT NULL,
  direction ENUM('inbound', 'outbound') DEFAULT 'outbound',
  status ENUM('queued', 'ringing', 'in-progress', 'completed', 'busy', 'failed', 'no-answer', 'canceled') DEFAULT 'queued',
  duration INT DEFAULT 0, -- in seconds
  price DECIMAL(10, 4) NULL, -- Cost in USD
  price_unit VARCHAR(3) DEFAULT 'USD',
  recording_url TEXT NULL,
  recording_sid VARCHAR(255) NULL,
  transcription TEXT NULL,
  start_time TIMESTAMP NULL,
  end_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (phone_number_id) REFERENCES user_phone_numbers(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_phone_number_id (phone_number_id),
  INDEX idx_call_sid (call_sid),
  INDEX idx_status (status),
  INDEX idx_direction (direction),
  INDEX idx_start_time (start_time)
);

-- ==== STEP 3: Create twilio_recordings table ====
CREATE TABLE twilio_recordings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recording_sid VARCHAR(255) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  call_sid VARCHAR(255) NOT NULL,
  phone_number_id INT NOT NULL,
  duration INT DEFAULT 0, -- in seconds
  channels INT DEFAULT 1, -- 1 = mono, 2 = stereo
  status ENUM('in-progress', 'paused', 'stopped', 'processing', 'completed', 'absent') DEFAULT 'in-progress',
  media_url TEXT NOT NULL,
  price DECIMAL(10, 4) NULL, -- Cost in USD
  price_unit VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (phone_number_id) REFERENCES user_phone_numbers(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_phone_number_id (phone_number_id),
  INDEX idx_call_sid (call_sid),
  INDEX idx_recording_sid (recording_sid),
  INDEX idx_status (status)
);

-- ==== STEP 4: Migrate existing data (if any) ====
-- If you have existing phone_numbers table data, migrate it to user_phone_numbers
-- This is a placeholder - adjust based on your current schema

-- Example migration (adjust column names as needed):
-- INSERT INTO user_phone_numbers (user_id, phone_number, twilio_sid, website_id, provider, monthly_fee, call_count, status, created_at, updated_at)
-- SELECT 1 as user_id, number, 'PLACEHOLDER_SID', website_id, provider, monthly_fee, call_count, status, created_at, updated_at
-- FROM phone_numbers;

-- ==== STEP 5: Add environment variable requirements ====
-- Make sure your .env file has these variables:
-- TWILIO_ACCOUNT_SID=your_twilio_account_sid
-- TWILIO_AUTH_TOKEN=your_twilio_auth_token
-- TWILIO_APP_SID=your_twiml_app_sid_for_routing
-- SERVER_URL=your_api_base_url_for_webhooks

-- ==== STEP 6: Update existing tables (optional) ====
-- Add user_id to existing tables if needed for better isolation

-- Example: Add user_id to websites table if not already present
-- ALTER TABLE websites ADD COLUMN user_id INT NULL;
-- ALTER TABLE websites ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- UPDATE websites SET user_id = 1 WHERE user_id IS NULL; -- Set default user

-- Example: Add user_id to leads table if not already present  
-- ALTER TABLE leads ADD COLUMN user_id INT NULL;
-- ALTER TABLE leads ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- UPDATE leads SET user_id = 1 WHERE user_id IS NULL; -- Set default user

-- ==== STEP 7: Create indexes for better performance ====
-- Additional indexes for common queries
CREATE INDEX idx_user_phone_numbers_user_status ON user_phone_numbers(user_id, status);
CREATE INDEX idx_twilio_calls_user_phone ON twilio_calls(user_id, phone_number_id);
CREATE INDEX idx_twilio_recordings_user_phone ON twilio_recordings(user_id, phone_number_id);

-- ==== STEP 8: Create views for easier querying ====
CREATE VIEW user_phone_number_stats AS
SELECT 
  upn.user_id,
  upn.id as phone_number_id,
  upn.phone_number,
  upn.status,
  COUNT(tc.id) as total_calls,
  COUNT(CASE WHEN tc.status = 'completed' THEN 1 END) as completed_calls,
  COUNT(CASE WHEN tc.direction = 'outbound' THEN 1 END) as outbound_calls,
  COUNT(CASE WHEN tc.direction = 'inbound' THEN 1 END) as inbound_calls,
  COUNT(tr.id) as total_recordings,
  COALESCE(SUM(tc.duration), 0) as total_duration_seconds,
  COALESCE(SUM(tc.price), 0) as total_call_cost,
  COALESCE(SUM(tr.price), 0) as total_recording_cost
FROM user_phone_numbers upn
LEFT JOIN twilio_calls tc ON upn.id = tc.phone_number_id
LEFT JOIN twilio_recordings tr ON upn.id = tr.phone_number_id
GROUP BY upn.id;

-- ==== STEP 9: Security considerations ====
-- Make sure your API endpoints validate:
-- 1. User owns the phone number before making calls
-- 2. User can only see their own call logs and recordings
-- 3. User can only manage their own phone numbers
-- 4. All webhook callbacks validate number ownership

-- ==== STEP 10: Sample data for testing (optional) ====
-- Uncomment and modify for testing purposes
-- INSERT INTO user_phone_numbers (user_id, phone_number, twilio_sid, country, region, locality) VALUES
-- (1, '+14155551234', 'PN1234567890abcdef', 'US', 'CA', 'San Francisco'),
-- (1, '+14155559876', 'PN0987654321fedcba', 'US', 'CA', 'San Francisco');

-- ==== NOTES ====
-- 1. Remove TWILIO_PHONE_NUMBER from your environment variables
-- 2. Users now pay for their own Twilio costs (numbers, calls, recordings)
-- 3. Each user has isolated phone numbers and call history
-- 4. Webhooks must validate user ownership before processing
-- 5. Consider adding billing integration to charge users for Twilio usage