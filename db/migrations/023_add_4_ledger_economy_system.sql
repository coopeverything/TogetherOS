-- Migration: 4-Ledger Economy System (RP, TBC, SH, Budgets)
-- Created: 2025-11-15
-- Purpose: Implement complete economic system with Reward Points, Timebank Credits,
--          Social Horizon fractions, and budget tracking
-- See: docs/guides/4-ledger-system.md for complete specification

-- ==================================================
-- Ledger 2: Reward Points (RP)
-- Purpose: Economic claims from contributions, dues, donations
-- ==================================================

-- Reward Points balances (per member)
CREATE TABLE IF NOT EXISTS reward_points_balances (
    member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
    available DECIMAL(10,2) NOT NULL DEFAULT 0,
    spent_on_tbc DECIMAL(10,2) NOT NULL DEFAULT 0,
    spent_on_sh DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT non_negative_earned CHECK (total_earned >= 0),
    CONSTRAINT non_negative_available CHECK (available >= 0),
    CONSTRAINT non_negative_spent_tbc CHECK (spent_on_tbc >= 0),
    CONSTRAINT non_negative_spent_sh CHECK (spent_on_sh >= 0),
    CONSTRAINT balance_integrity CHECK (available + spent_on_tbc + spent_on_sh <= total_earned + 0.01)
);

-- Reward Points transactions (immutable log)
CREATE TABLE IF NOT EXISTS reward_points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'earn_contribution', 'earn_dues', 'earn_donation', 'spend_tbc', 'spend_sh', 'spend_perk'
    amount DECIMAL(10,2) NOT NULL,
    source VARCHAR(100), -- 'pr_merged', 'monthly_dues', 'donation_campaign_X', etc.
    metadata JSONB, -- Event-specific details
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rp_transactions_member ON reward_points_transactions(member_id, created_at DESC);
CREATE INDEX idx_rp_transactions_type ON reward_points_transactions(type);

-- RP earning rules (configurable via governance)
CREATE TABLE IF NOT EXISTS rp_earning_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL UNIQUE, -- Same as reward_events.event_type
    rp_amount DECIMAL(10,2) NOT NULL,
    min_threshold JSONB, -- Minimum criteria (e.g., PR size, contribution quality)
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_rp_amount CHECK (rp_amount > 0)
);

-- Seed initial RP earning rules aligned with SP weights
INSERT INTO rp_earning_rules (event_type, rp_amount, min_threshold) VALUES
    ('pr_merged_small', 25, '{"lines_changed": {"max": 50}}'::jsonb),
    ('pr_merged_medium', 50, '{"lines_changed": {"min": 50, "max": 200}}'::jsonb),
    ('pr_merged_large', 100, '{"lines_changed": {"min": 200}}'::jsonb),
    ('docs_contribution', 40, '{}'::jsonb),
    ('code_review', 15, '{}'::jsonb),
    ('issue_triage', 10, '{}'::jsonb),
    ('bug_fix', 75, '{}'::jsonb),
    ('monthly_dues_paid', 100, '{}'::jsonb),
    ('donation', 200, '{"min_amount_usd": 10}'::jsonb)
ON CONFLICT (event_type) DO NOTHING;

-- ==================================================
-- Ledger 3: Timebank Credits (TBC)
-- Purpose: Time-based service exchange with flexible pricing
-- ==================================================

-- Timebank accounts (per member)
CREATE TABLE IF NOT EXISTS timebank_accounts (
    member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT balance_integrity CHECK (balance = total_earned - total_spent),
    CONSTRAINT non_negative_balance CHECK (balance >= 0)
);

-- Timebank transactions (service exchanges)
CREATE TABLE IF NOT EXISTS timebank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES timebank_services(id) ON DELETE SET NULL,
    service_description TEXT NOT NULL,
    tbc_cost DECIMAL(10,2) NOT NULL,
    hourly_rate DECIMAL(10,2), -- TBC per hour (1, 2, or 3 typically)
    hours_provided DECIMAL(10,2), -- Duration
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'disputed', 'resolved'
    confirmed_at TIMESTAMPTZ,
    metadata JSONB, -- Additional details
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_tbc_cost CHECK (tbc_cost > 0),
    CONSTRAINT valid_hourly_rate CHECK (hourly_rate IS NULL OR hourly_rate > 0),
    CONSTRAINT valid_hours CHECK (hours_provided IS NULL OR hours_provided > 0),
    CONSTRAINT no_self_service CHECK (provider_id != receiver_id)
);

CREATE INDEX idx_timebank_transactions_provider ON timebank_transactions(provider_id, created_at DESC);
CREATE INDEX idx_timebank_transactions_receiver ON timebank_transactions(receiver_id, created_at DESC);
CREATE INDEX idx_timebank_transactions_status ON timebank_transactions(status);

-- Timebank services (member offerings)
CREATE TABLE IF NOT EXISTS timebank_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL, -- 'tutoring', 'massage', 'repair', 'medical', etc.
    title VARCHAR(200) NOT NULL,
    description TEXT,
    tbc_per_hour DECIMAL(10,2) NOT NULL, -- Pricing (1, 2, or 3 typically)
    availability VARCHAR(50), -- 'weekdays', 'weekends', 'by_appointment', etc.
    location_preference VARCHAR(100), -- 'remote', 'in_person', 'both'
    city_id UUID REFERENCES city_groups(id) ON DELETE SET NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_pricing CHECK (tbc_per_hour >= 1 AND tbc_per_hour <= 10)
);

CREATE INDEX idx_timebank_services_member ON timebank_services(member_id);
CREATE INDEX idx_timebank_services_type ON timebank_services(service_type);
CREATE INDEX idx_timebank_services_city ON timebank_services(city_id) WHERE city_id IS NOT NULL;
CREATE INDEX idx_timebank_services_active ON timebank_services(active) WHERE active = TRUE;

-- RP → TBC conversions (monthly throttling enforcement)
CREATE TABLE IF NOT EXISTS rp_to_tbc_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rp_spent DECIMAL(10,2) NOT NULL,
    tbc_received DECIMAL(10,2) NOT NULL,
    conversion_month DATE NOT NULL, -- YYYY-MM-01 format for monthly tracking
    rate_used DECIMAL(10,2) NOT NULL, -- RP per 1 TBC (e.g., 100)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_rp_spent CHECK (rp_spent > 0),
    CONSTRAINT positive_tbc_received CHECK (tbc_received > 0),
    CONSTRAINT positive_rate CHECK (rate_used > 0)
);

CREATE INDEX idx_rp_tbc_conversions_member_month ON rp_to_tbc_conversions(member_id, conversion_month);

-- ==================================================
-- Ledger 4: Social Horizon (SH) Fractions
-- Purpose: Long-term cooperative asset shares
-- ==================================================

-- Social Horizon wallets (per member)
CREATE TABLE IF NOT EXISTS social_horizon_wallets (
    member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sh_balance DECIMAL(10,4) NOT NULL DEFAULT 0,
    total_issued DECIMAL(10,4) NOT NULL DEFAULT 0,
    total_transferred DECIMAL(10,4) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT balance_integrity CHECK (sh_balance = total_issued - total_transferred),
    CONSTRAINT non_negative_balance CHECK (sh_balance >= 0)
);

-- SH issuance cycles (periodic distribution)
CREATE TABLE IF NOT EXISTS sh_issuance_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_name VARCHAR(100) NOT NULL UNIQUE, -- 'Q1 2025', 'Q2 2025', etc.
    issuance_date DATE NOT NULL,
    total_sh_issued DECIMAL(10,4) NOT NULL,
    contribution_allocated DECIMAL(10,4) NOT NULL, -- Portion for contribution-based allocation (e.g., 80%)
    purchase_allocated DECIMAL(10,4) NOT NULL, -- Portion for RP/money purchase events (e.g., 20%)
    formula_used TEXT, -- Description of allocation formula
    metadata JSONB, -- Additional cycle parameters
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_issuance CHECK (total_sh_issued > 0),
    CONSTRAINT allocation_sum CHECK (contribution_allocated + purchase_allocated <= total_sh_issued + 0.01)
);

-- SH allocations (per cycle, per member)
CREATE TABLE IF NOT EXISTS sh_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES sh_issuance_cycles(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sh_amount DECIMAL(10,4) NOT NULL,
    basis VARCHAR(50) NOT NULL, -- 'contribution', 'timebank_activity', 'rp_purchase', 'money_purchase'
    calculation_details JSONB, -- How amount was calculated
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_sh_amount CHECK (sh_amount > 0),
    UNIQUE (cycle_id, member_id, basis)
);

CREATE INDEX idx_sh_allocations_cycle ON sh_allocations(cycle_id);
CREATE INDEX idx_sh_allocations_member ON sh_allocations(member_id);

-- SH purchase events (rare, capped)
CREATE TABLE IF NOT EXISTS sh_purchase_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(200) NOT NULL UNIQUE,
    cycle_id UUID REFERENCES sh_issuance_cycles(id) ON DELETE SET NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    rp_per_sh DECIMAL(10,2), -- RP cost per 1 SH (if RP event)
    money_per_sh DECIMAL(10,2), -- USD cost per 1 SH (if money event)
    sh_cap_per_person DECIMAL(10,4) NOT NULL, -- Max SH per member
    global_sh_cap DECIMAL(10,4) NOT NULL, -- Total SH available in event
    sh_distributed DECIMAL(10,4) NOT NULL DEFAULT 0,
    fiscal_regularity_required BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'closed'
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date > start_date),
    CONSTRAINT valid_pricing CHECK ((rp_per_sh IS NOT NULL AND rp_per_sh > 0) OR (money_per_sh IS NOT NULL AND money_per_sh > 0)),
    CONSTRAINT positive_caps CHECK (sh_cap_per_person > 0 AND global_sh_cap > 0),
    CONSTRAINT distributed_within_cap CHECK (sh_distributed <= global_sh_cap + 0.01)
);

-- SH transactions (transfers, purchases, dividends)
CREATE TABLE IF NOT EXISTS sh_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_wallet UUID REFERENCES social_horizon_wallets(member_id) ON DELETE SET NULL,
    to_wallet UUID REFERENCES social_horizon_wallets(member_id) ON DELETE SET NULL,
    amount DECIMAL(10,4) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'issuance', 'rp_purchase', 'money_purchase', 'dividend', 'transfer'
    event_id UUID REFERENCES sh_purchase_events(id) ON DELETE SET NULL,
    cycle_id UUID REFERENCES sh_issuance_cycles(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_sh_transactions_from ON sh_transactions(from_wallet, created_at DESC);
CREATE INDEX idx_sh_transactions_to ON sh_transactions(to_wallet, created_at DESC);
CREATE INDEX idx_sh_transactions_type ON sh_transactions(transaction_type);

-- ==================================================
-- Global & Local Budgets
-- Purpose: Track funds from membership fees and donations
-- ==================================================

-- Global budgets (platform-wide funds)
CREATE TABLE IF NOT EXISTS global_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_type VARCHAR(50) NOT NULL UNIQUE, -- 'infra', 'legal', 'platform_team', 'solidarity'
    balance_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_allocated_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_spent_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT balance_integrity CHECK (balance_usd = total_allocated_usd - total_spent_usd),
    CONSTRAINT non_negative_balance CHECK (balance_usd >= 0)
);

-- Seed global budget categories
INSERT INTO global_budgets (fund_type, balance_usd, total_allocated_usd, total_spent_usd) VALUES
    ('infra', 0, 0, 0),
    ('legal', 0, 0, 0),
    ('platform_team', 0, 0, 0),
    ('solidarity', 0, 0, 0)
ON CONFLICT (fund_type) DO NOTHING;

-- City budgets (local funds per city)
CREATE TABLE IF NOT EXISTS city_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES city_groups(id) ON DELETE CASCADE,
    fund_type VARCHAR(50) NOT NULL, -- 'local', 'event'
    balance_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_allocated_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_spent_usd DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT balance_integrity CHECK (balance_usd = total_allocated_usd - total_spent_usd),
    CONSTRAINT non_negative_balance CHECK (balance_usd >= 0),
    UNIQUE (city_id, fund_type)
);

CREATE INDEX idx_city_budgets_city ON city_budgets(city_id);

-- Membership fees (tracking)
CREATE TABLE IF NOT EXISTS membership_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    rp_granted DECIMAL(10,2) NOT NULL,
    allocation_split JSONB NOT NULL, -- {"global_infra": 0.5, "local_city": 0.3, "solidarity": 0.2}
    payment_method VARCHAR(50), -- 'stripe', 'paypal', 'crypto', etc.
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_amount CHECK (amount_usd > 0),
    CONSTRAINT positive_rp CHECK (rp_granted > 0)
);

CREATE INDEX idx_membership_fees_member ON membership_fees(member_id, payment_date DESC);

-- Donations (tracking)
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    rp_granted DECIMAL(10,2), -- NULL if donor is anonymous or not a member
    campaign_id VARCHAR(100), -- Campaign name/ID if part of a specific campaign
    tier VARCHAR(20), -- 'bronze', 'silver', 'gold', 'platinum' based on total donated
    allocation_split JSONB NOT NULL, -- {"global_infra": 0.4, "local_city": 0.4, "solidarity": 0.2}
    payment_method VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_amount CHECK (amount_usd > 0),
    CONSTRAINT valid_rp CHECK (rp_granted IS NULL OR rp_granted > 0)
);

CREATE INDEX idx_donations_donor ON donations(donor_id, created_at DESC) WHERE donor_id IS NOT NULL;
CREATE INDEX idx_donations_campaign ON donations(campaign_id) WHERE campaign_id IS NOT NULL;

-- ==================================================
-- Helper Functions & Triggers
-- ==================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_reward_points_balances_updated_at BEFORE UPDATE ON reward_points_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_timebank_accounts_updated_at BEFORE UPDATE ON timebank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_timebank_services_updated_at BEFORE UPDATE ON timebank_services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_social_horizon_wallets_updated_at BEFORE UPDATE ON social_horizon_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sh_purchase_events_updated_at BEFORE UPDATE ON sh_purchase_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_global_budgets_updated_at BEFORE UPDATE ON global_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_city_budgets_updated_at BEFORE UPDATE ON city_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_rp_earning_rules_updated_at BEFORE UPDATE ON rp_earning_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Initialize RP balance for new users (trigger on users table)
CREATE OR REPLACE FUNCTION initialize_rp_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO reward_points_balances (member_id, total_earned, available)
    VALUES (NEW.id, 0, 0)
    ON CONFLICT (member_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_user_rp_balance AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION initialize_rp_balance();

-- Initialize TBC account for new users
CREATE OR REPLACE FUNCTION initialize_tbc_account()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO timebank_accounts (member_id, balance, total_earned, total_spent)
    VALUES (NEW.id, 0, 0, 0)
    ON CONFLICT (member_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_user_tbc_account AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION initialize_tbc_account();

-- Initialize SH wallet for new users
CREATE OR REPLACE FUNCTION initialize_sh_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO social_horizon_wallets (member_id, sh_balance, total_issued, total_transferred)
    VALUES (NEW.id, 0, 0, 0)
    ON CONFLICT (member_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_user_sh_wallet AFTER INSERT ON users FOR EACH ROW EXECUTE FUNCTION initialize_sh_wallet();

-- Migration complete
-- Next steps: Create TypeScript types, API endpoints, and UI dashboards
