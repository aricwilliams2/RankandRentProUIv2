-- Call Forwarding Database Migration
-- File: supabase/migrations/20250115000007_create_call_forwarding.sql

-- Create call_forwarding table
CREATE TABLE IF NOT EXISTS call_forwarding (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone_number_id INTEGER NOT NULL REFERENCES user_phone_numbers(id) ON DELETE CASCADE,
    forward_to_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    forwarding_type VARCHAR(20) NOT NULL DEFAULT 'always' CHECK (forwarding_type IN ('always', 'busy', 'no_answer', 'unavailable')),
    ring_timeout INTEGER DEFAULT 20 CHECK (ring_timeout >= 5 AND ring_timeout <= 60),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_forwarding_user_id ON call_forwarding(user_id);
CREATE INDEX IF NOT EXISTS idx_call_forwarding_phone_number_id ON call_forwarding(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_call_forwarding_active ON call_forwarding(is_active);

-- Create unique constraint to prevent multiple active forwarding rules for the same phone number
CREATE UNIQUE INDEX IF NOT EXISTS idx_call_forwarding_unique_active 
ON call_forwarding(phone_number_id) WHERE is_active = true;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_call_forwarding_updated_at 
    BEFORE UPDATE ON call_forwarding 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE call_forwarding IS 'Stores call forwarding settings for user phone numbers';
COMMENT ON COLUMN call_forwarding.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN call_forwarding.phone_number_id IS 'Foreign key to user_phone_numbers table';
COMMENT ON COLUMN call_forwarding.forward_to_number IS 'Phone number to forward calls to (E.164 format)';
COMMENT ON COLUMN call_forwarding.is_active IS 'Whether the forwarding rule is currently active';
COMMENT ON COLUMN call_forwarding.forwarding_type IS 'Type of forwarding: always, busy, no_answer, unavailable';
COMMENT ON COLUMN call_forwarding.ring_timeout IS 'Seconds to ring before forwarding (5-60 seconds)';
