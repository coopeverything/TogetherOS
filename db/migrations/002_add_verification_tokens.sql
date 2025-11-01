-- Migration: Add verification_tokens table
-- Purpose: Support email verification and password reset flows
-- Date: 2025-10-31

CREATE TABLE IF NOT EXISTS verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);

-- Comments
COMMENT ON TABLE verification_tokens IS 'Email verification and password reset tokens';
COMMENT ON COLUMN verification_tokens.type IS 'Token type: email_verification or password_reset';
COMMENT ON COLUMN verification_tokens.expires_at IS 'Token expiration time (24h for email, 1h for password reset)';
COMMENT ON COLUMN verification_tokens.used_at IS 'When token was used (prevents reuse)';
