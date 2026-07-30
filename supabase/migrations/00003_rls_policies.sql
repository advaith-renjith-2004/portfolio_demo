-- ============================================================================
-- Migration 00003: Row Level Security Policies
-- Description: Comprehensive RLS policies for all tables.
--              Public users can read visible content, add reactions/views.
--              Authenticated users have full CRUD access.
-- ============================================================================

-- ============================================================================
-- COLUMNS TABLE RLS
-- ============================================================================

ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- Public: Can only see visible columns
CREATE POLICY "public_select_visible_columns" ON columns
    FOR SELECT
    TO anon
    USING (is_visible = true);

-- Authenticated: Full read access (including hidden)
CREATE POLICY "authenticated_select_all_columns" ON columns
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated: Insert new columns
CREATE POLICY "authenticated_insert_columns" ON columns
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated: Update columns
CREATE POLICY "authenticated_update_columns" ON columns
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated: Delete columns
CREATE POLICY "authenticated_delete_columns" ON columns
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- CARDS TABLE RLS
-- ============================================================================

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Public: Can only see visible cards in visible columns
CREATE POLICY "public_select_visible_cards" ON cards
    FOR SELECT
    TO anon
    USING (
        is_visible = true
        AND is_column_visible(column_id)
    );

-- Authenticated: Full read access
CREATE POLICY "authenticated_select_all_cards" ON cards
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated: Insert cards (validates column exists)
CREATE POLICY "authenticated_insert_cards" ON cards
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM columns WHERE id = column_id)
    );

-- Authenticated: Update cards
CREATE POLICY "authenticated_update_cards" ON cards
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (
        EXISTS (SELECT 1 FROM columns WHERE id = column_id)
    );

-- Authenticated: Delete cards
CREATE POLICY "authenticated_delete_cards" ON cards
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- TAGS TABLE RLS
-- ============================================================================

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Tags are globally readable (don't expose sensitive info)
CREATE POLICY "public_select_tags" ON tags
    FOR SELECT
    TO anon
    USING (true);

-- Authenticated: Full read access
CREATE POLICY "authenticated_select_tags" ON tags
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated: Insert tags
CREATE POLICY "authenticated_insert_tags" ON tags
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated: Update tags
CREATE POLICY "authenticated_update_tags" ON tags
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated: Delete tags
CREATE POLICY "authenticated_delete_tags" ON tags
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- CARD_TAGS TABLE RLS (Junction Table)
-- ============================================================================

ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;

-- Public: Can only see associations for visible cards
-- Prevents information leakage about hidden cards
CREATE POLICY "public_select_card_tags" ON card_tags
    FOR SELECT
    TO anon
    USING (is_card_visible(card_id));

-- Authenticated: Full read access
CREATE POLICY "authenticated_select_card_tags" ON card_tags
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated: Insert (validates both card and tag exist)
CREATE POLICY "authenticated_insert_card_tags" ON card_tags
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM cards WHERE id = card_id)
        AND EXISTS (SELECT 1 FROM tags WHERE id = tag_id)
    );

-- Authenticated: Delete
CREATE POLICY "authenticated_delete_card_tags" ON card_tags
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- LINKS TABLE RLS
-- ============================================================================

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Public: Can only see links for visible cards
CREATE POLICY "public_select_links" ON links
    FOR SELECT
    TO anon
    USING (is_card_visible(card_id));

-- Authenticated: Full read access
CREATE POLICY "authenticated_select_links" ON links
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated: Insert (validates card exists)
CREATE POLICY "authenticated_insert_links" ON links
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM cards WHERE id = card_id)
    );

-- Authenticated: Update
CREATE POLICY "authenticated_update_links" ON links
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (
        EXISTS (SELECT 1 FROM cards WHERE id = card_id)
    );

-- Authenticated: Delete
CREATE POLICY "authenticated_delete_links" ON links
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- SESSIONS TABLE RLS
-- ============================================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Public: Can create new sessions
CREATE POLICY "public_insert_sessions" ON sessions
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Session ID must be a reasonable length (UUID format)
        length(session_id) >= 32 AND length(session_id) <= 64
        -- Display name must be reasonable length if provided
        AND (display_name IS NULL OR length(display_name) <= 50)
    );

-- Public: Can update their own session (by session_id match)
-- Note: This relies on the client sending the correct session_id
CREATE POLICY "public_update_sessions" ON sessions
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (
        length(session_id) >= 32 AND length(session_id) <= 64
    );

-- Public: Cannot read sessions (privacy)
-- No SELECT policy for anon role

-- Authenticated: Full access
CREATE POLICY "authenticated_select_sessions" ON sessions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "authenticated_insert_sessions" ON sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "authenticated_update_sessions" ON sessions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "authenticated_delete_sessions" ON sessions
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- REACTIONS TABLE RLS
-- ============================================================================

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Public: Can view reactions for visible cards only
CREATE POLICY "public_select_reactions" ON reactions
    FOR SELECT
    TO anon
    USING (is_card_visible(card_id));

-- Authenticated: Full read access
CREATE POLICY "authenticated_select_reactions" ON reactions
    FOR SELECT
    TO authenticated
    USING (true);

-- Public: Can insert reactions with validation
-- Key protections:
-- 1. Card must be visible
-- 2. Session must be valid (registered and recent)
-- 3. Rate limit check (max 10/hour/session)
-- 4. Reaction type must be valid
CREATE POLICY "public_insert_reactions" ON reactions
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Card must be visible
        is_card_visible(card_id)
        -- Session must exist in sessions table and be recent
        AND is_valid_session(session_id)
        -- Rate limiting: max 10 reactions per hour per session
        AND can_session_react(session_id, card_id)
        -- Reaction type must be valid (additional validation beyond CHECK constraint)
        AND reaction_type IN ('thumbsup', 'fire', 'eyes', 'lightbulb')
    );

-- Authenticated: Can insert without restrictions
CREATE POLICY "authenticated_insert_reactions" ON reactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated: Can delete any reaction (for moderation)
CREATE POLICY "authenticated_delete_reactions" ON reactions
    FOR DELETE
    TO authenticated
    USING (true);

-- No update policy - reactions are immutable once created

-- ============================================================================
-- CARD_VIEWS TABLE RLS
-- ============================================================================

ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;

-- Public: Can insert view records for visible cards
CREATE POLICY "public_insert_card_views" ON card_views
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Card must be visible
        is_card_visible(card_id)
        -- Session ID must be valid format
        AND session_id IS NOT NULL
        AND length(session_id) >= 32
    );

-- Public: CANNOT read analytics (privacy protection)
-- No SELECT policy for anon role

-- Authenticated: Full read access
CREATE POLICY "authenticated_select_card_views" ON card_views
    FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated: Can insert
CREATE POLICY "authenticated_insert_card_views" ON card_views
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated: Can delete analytics data
CREATE POLICY "authenticated_delete_card_views" ON card_views
    FOR DELETE
    TO authenticated
    USING (true);
