-- Migration: 058_timebank_marketplace_enhancements
-- Date: 2025-12-13
-- Description: Add Simbi-style marketplace features: images, ratings, provider stats

-- ============================================
-- 1. ADD IMAGE SUPPORT TO SERVICES
-- ============================================

-- Add image_url column to existing timebank_services table
ALTER TABLE timebank_services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add images array for multiple images (future use)
ALTER TABLE timebank_services ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- 2. CREATE RATINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS timebank_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES timebank_transactions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- One rating per reviewer per transaction
    CONSTRAINT unique_rating_per_transaction UNIQUE(transaction_id, reviewer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_timebank_ratings_provider ON timebank_ratings(provider_id);
CREATE INDEX IF NOT EXISTS idx_timebank_ratings_transaction ON timebank_ratings(transaction_id);
CREATE INDEX IF NOT EXISTS idx_timebank_ratings_created ON timebank_ratings(created_at DESC);

COMMENT ON TABLE timebank_ratings IS 'Star ratings and reviews for timebank service transactions';
COMMENT ON COLUMN timebank_ratings.rating IS '1-5 star rating';
COMMENT ON COLUMN timebank_ratings.review_text IS 'Optional text review from the receiver';

-- ============================================
-- 3. CREATE PROVIDER STATS TABLE
-- ============================================

-- Badge types as a type for validation
DO $$ BEGIN
    CREATE TYPE timebank_badge AS ENUM (
        'verified',        -- Email/ID verified
        'helper',          -- 10+ completed exchanges
        'expert',          -- 50+ completed exchanges
        'top_provider',    -- Top 10 this month
        'quick_responder', -- Avg response < 24hrs
        'five_star'        -- Avg rating >= 4.8
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS timebank_provider_stats (
    member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    avg_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    total_transactions INTEGER NOT NULL DEFAULT 0,
    badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    response_time_hours DECIMAL(10,2), -- Average response time in hours
    last_active_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_provider_stats_rating ON timebank_provider_stats(avg_rating DESC) WHERE total_reviews >= 3;
CREATE INDEX IF NOT EXISTS idx_provider_stats_transactions ON timebank_provider_stats(total_transactions DESC);

COMMENT ON TABLE timebank_provider_stats IS 'Cached provider statistics for marketplace display';
COMMENT ON COLUMN timebank_provider_stats.badges IS 'JSON array of badge names: ["verified", "helper", "expert"]';

-- ============================================
-- 4. TRIGGER TO UPDATE PROVIDER STATS
-- ============================================

CREATE OR REPLACE FUNCTION update_provider_stats_on_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert provider stats when a new rating is added
    INSERT INTO timebank_provider_stats (member_id, avg_rating, total_reviews, updated_at)
    SELECT
        NEW.provider_id,
        COALESCE(AVG(rating), 0),
        COUNT(*),
        NOW()
    FROM timebank_ratings
    WHERE provider_id = NEW.provider_id
    ON CONFLICT (member_id) DO UPDATE SET
        avg_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM timebank_ratings
            WHERE provider_id = NEW.provider_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM timebank_ratings
            WHERE provider_id = NEW.provider_id
        ),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_provider_stats ON timebank_ratings;
CREATE TRIGGER trigger_update_provider_stats
    AFTER INSERT ON timebank_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_stats_on_rating();

-- ============================================
-- 5. TRIGGER TO UPDATE TRANSACTION COUNT
-- ============================================

CREATE OR REPLACE FUNCTION update_provider_transaction_count()
RETURNS TRIGGER AS $$
BEGIN
    -- When a transaction is confirmed, update provider's transaction count
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        INSERT INTO timebank_provider_stats (member_id, total_transactions, updated_at)
        VALUES (NEW.provider_id, 1, NOW())
        ON CONFLICT (member_id) DO UPDATE SET
            total_transactions = timebank_provider_stats.total_transactions + 1,
            last_active_at = NOW(),
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_provider_transactions ON timebank_transactions;
CREATE TRIGGER trigger_update_provider_transactions
    AFTER INSERT OR UPDATE ON timebank_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_transaction_count();

-- ============================================
-- 6. FUNCTION TO CALCULATE BADGES
-- ============================================

CREATE OR REPLACE FUNCTION calculate_provider_badges(p_member_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_badges JSONB := '[]'::jsonb;
    v_stats RECORD;
    v_is_verified BOOLEAN;
    v_is_top_10 BOOLEAN;
BEGIN
    -- Get current stats
    SELECT * INTO v_stats FROM timebank_provider_stats WHERE member_id = p_member_id;

    -- Check if user email is verified (basic verification)
    SELECT email_verified INTO v_is_verified FROM users WHERE id = p_member_id;

    IF v_is_verified THEN
        v_badges := v_badges || '["verified"]'::jsonb;
    END IF;

    -- Helper badge: 10+ transactions
    IF v_stats.total_transactions >= 10 THEN
        v_badges := v_badges || '["helper"]'::jsonb;
    END IF;

    -- Expert badge: 50+ transactions
    IF v_stats.total_transactions >= 50 THEN
        v_badges := v_badges || '["expert"]'::jsonb;
    END IF;

    -- Five star badge: avg >= 4.8 with at least 5 reviews
    IF v_stats.avg_rating >= 4.8 AND v_stats.total_reviews >= 5 THEN
        v_badges := v_badges || '["five_star"]'::jsonb;
    END IF;

    -- Quick responder: avg response < 24 hours
    IF v_stats.response_time_hours IS NOT NULL AND v_stats.response_time_hours < 24 THEN
        v_badges := v_badges || '["quick_responder"]'::jsonb;
    END IF;

    -- Top provider: Check if in top 10 by transactions this month
    SELECT EXISTS (
        SELECT 1 FROM timebank_provider_stats
        WHERE total_transactions > 0
        ORDER BY total_transactions DESC
        LIMIT 10
    ) AND p_member_id IN (
        SELECT member_id FROM timebank_provider_stats
        ORDER BY total_transactions DESC
        LIMIT 10
    ) INTO v_is_top_10;

    IF v_is_top_10 THEN
        v_badges := v_badges || '["top_provider"]'::jsonb;
    END IF;

    RETURN v_badges;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. VIEW FOR SERVICES WITH PROVIDER STATS
-- ============================================

CREATE OR REPLACE VIEW timebank_services_with_provider AS
SELECT
    s.*,
    u.name as provider_name,
    u.email as provider_email,
    COALESCE(ps.avg_rating, 0) as provider_avg_rating,
    COALESCE(ps.total_reviews, 0) as provider_total_reviews,
    COALESCE(ps.total_transactions, 0) as provider_total_transactions,
    COALESCE(ps.badges, '[]'::jsonb) as provider_badges
FROM timebank_services s
JOIN users u ON s.member_id = u.id
LEFT JOIN timebank_provider_stats ps ON s.member_id = ps.member_id
WHERE s.active = TRUE;

COMMENT ON VIEW timebank_services_with_provider IS 'Services joined with provider stats for marketplace display';

-- ============================================
-- 8. INITIALIZE STATS FOR EXISTING PROVIDERS
-- ============================================

-- Create stats records for users who have provided services
INSERT INTO timebank_provider_stats (member_id, total_transactions, updated_at)
SELECT DISTINCT
    t.provider_id,
    COUNT(*) FILTER (WHERE t.status = 'confirmed'),
    NOW()
FROM timebank_transactions t
GROUP BY t.provider_id
ON CONFLICT (member_id) DO UPDATE SET
    total_transactions = EXCLUDED.total_transactions,
    updated_at = NOW();

-- Update badges for all existing providers
UPDATE timebank_provider_stats
SET badges = calculate_provider_badges(member_id);
