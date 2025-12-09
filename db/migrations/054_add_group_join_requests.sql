-- Migration: 054_add_group_join_requests
-- Description: Add table for pending group join requests (approval workflow)
-- Module: groups

-- Create group_join_requests table
CREATE TABLE IF NOT EXISTS group_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id),
    message TEXT, -- Optional message from the user requesting to join
    rejection_reason TEXT, -- Optional reason if rejected
    UNIQUE(group_id, user_id, status) -- Prevent duplicate pending requests
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_status
    ON group_join_requests(group_id, status);

CREATE INDEX IF NOT EXISTS idx_group_join_requests_user
    ON group_join_requests(user_id);

-- Add constraint to ensure user is not already a member when requesting
-- This is enforced at application level, but we document it here
COMMENT ON TABLE group_join_requests IS 'Pending join requests for groups with approval-required membership';
COMMENT ON COLUMN group_join_requests.status IS 'pending = awaiting admin review, approved = member added, rejected = request denied';
