-- ============================================================================
-- Migration 00002: Security Functions
-- Description: Helper functions for Row Level Security policies.
--              These functions handle session validation, visibility checks,
--              and rate limiting.
-- ============================================================================

-- ============================================================================
-- SESSION VALIDATION FUNCTIONS
-- ============================================================================

-- Validate that a session exists and is recent (within last 30 days)
-- Used to prevent reactions from fabricated session IDs
CREATE OR REPLACE FUNCTION is_valid_session(p_session_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM sessions
        WHERE session_id = p_session_id
        AND last_seen_at > NOW() - INTERVAL '30 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_valid_session IS 'Checks if session exists and was active within 30 days';

-- Check if the current user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_authenticated IS 'Returns true if user is authenticated';

-- ============================================================================
-- VISIBILITY CHECK FUNCTIONS
-- ============================================================================

-- Check if a card is visible (for junction table policies)
-- This ensures that card_tags, links, and reactions for hidden cards
-- are not exposed to public users
CREATE OR REPLACE FUNCTION is_card_visible(p_card_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_visible BOOLEAN;
    v_column_id UUID;
BEGIN
    SELECT is_visible, column_id INTO v_is_visible, v_column_id
    FROM cards
    WHERE id = p_card_id;

    -- Card doesn't exist
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Card is not visible
    IF NOT v_is_visible THEN
        RETURN FALSE;
    END IF;

    -- Check if parent column is visible
    RETURN is_column_visible(v_column_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_card_visible IS 'Checks if card and its parent column are both visible';

-- Check if a column is visible
CREATE OR REPLACE FUNCTION is_column_visible(p_column_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM columns
        WHERE id = p_column_id
        AND is_visible = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_column_visible IS 'Checks if column is visible';

-- ============================================================================
-- RATE LIMITING FUNCTIONS
-- ============================================================================

-- Check if a session can add more reactions (rate limiting)
-- Limits to 10 reactions per hour per session across all cards
CREATE OR REPLACE FUNCTION can_session_react(p_session_id TEXT, p_card_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    recent_reaction_count INTEGER;
BEGIN
    -- Count reactions from this session in the last hour
    SELECT COUNT(*) INTO recent_reaction_count
    FROM reactions
    WHERE session_id = p_session_id
    AND created_at > NOW() - INTERVAL '1 hour';

    -- Allow if under 10 reactions per hour
    RETURN recent_reaction_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION can_session_react IS 'Rate limiting: max 10 reactions per hour per session';

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Get reaction counts by type for a card
CREATE OR REPLACE FUNCTION get_card_reaction_counts(p_card_id UUID)
RETURNS TABLE (
    reaction_type TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.reaction_type, COUNT(*)::BIGINT
    FROM reactions r
    WHERE r.card_id = p_card_id
    GROUP BY r.reaction_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_card_reaction_counts IS 'Returns reaction counts grouped by type for a card';

-- Get view count for a card
CREATE OR REPLACE FUNCTION get_card_view_count(p_card_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_count BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM card_views
    WHERE card_id = p_card_id;

    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_card_view_count IS 'Returns total view count for a card';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION is_valid_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_authenticated TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_card_visible TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_column_visible TO anon, authenticated;
GRANT EXECUTE ON FUNCTION can_session_react TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_card_reaction_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_card_view_count TO anon, authenticated;
