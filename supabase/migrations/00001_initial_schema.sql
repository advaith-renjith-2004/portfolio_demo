-- ============================================================================
-- Migration 00001: Initial Schema
-- Description: Creates all tables, enums, indexes, and triggers for the KanBan
--              portfolio board application.
-- ============================================================================

-- Enable required extensions
-- Note: Using gen_random_uuid() which is built-in to Postgres 13+
-- instead of uuid-ossp extension

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Card type enum for categorizing content
CREATE TYPE card_type AS ENUM (
    'experience',
    'project',
    'skill',
    'education',
    'about'
);

-- Link type enum for external links
CREATE TYPE link_type AS ENUM (
    'github',
    'demo',
    'article',
    'external'
);

-- Tag category enum for organizing tags
CREATE TYPE tag_category AS ENUM (
    'language',
    'framework',
    'database',
    'tool',
    'platform',
    'concept'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Columns table: Represents board columns (About, Experience, Projects, etc.)
CREATE TABLE columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    position INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE columns IS 'Board columns for organizing cards';
COMMENT ON COLUMN columns.slug IS 'URL-friendly identifier for the column';
COMMENT ON COLUMN columns.position IS 'Display order of the column';

-- Cards table: Main content items
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    card_type card_type NOT NULL,
    position FLOAT DEFAULT 0,
    title TEXT NOT NULL,
    subtitle TEXT,
    date_start DATE,
    date_end DATE,
    preview_text TEXT,
    full_content TEXT,
    metadata JSONB DEFAULT '{}',
    thumbnail_url TEXT,
    is_pinned BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE cards IS 'Content cards displayed on the board';
COMMENT ON COLUMN cards.position IS 'Fractional position for drag-and-drop ordering';
COMMENT ON COLUMN cards.date_end IS 'NULL indicates "Present" for ongoing items';
COMMENT ON COLUMN cards.full_content IS 'Markdown content for expanded view';
COMMENT ON COLUMN cards.metadata IS 'Flexible JSON storage for type-specific data';

-- Tags table: Categorized labels for cards
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category tag_category,
    color TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tags IS 'Tags for categorizing and filtering cards';
COMMENT ON COLUMN tags.color IS 'Hex color code (e.g., #3B82F6)';

-- Card-Tags junction table: Many-to-many relationship
CREATE TABLE card_tags (
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (card_id, tag_id)
);

COMMENT ON TABLE card_tags IS 'Junction table for card-tag relationships';

-- Links table: External links associated with cards
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    link_type link_type DEFAULT 'external',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE links IS 'External links associated with cards';

-- Sessions table: Anonymous visitor session tracking
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    fingerprint TEXT,
    display_name TEXT,
    user_agent TEXT,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sessions IS 'Anonymous visitor sessions for reactions and analytics';
COMMENT ON COLUMN sessions.session_id IS 'Client-generated session identifier';
COMMENT ON COLUMN sessions.fingerprint IS 'Browser fingerprint hash for session validation';

-- Reactions table: Anonymous user reactions to cards
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('thumbsup', 'fire', 'eyes', 'lightbulb')),
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(card_id, session_id, reaction_type)
);

COMMENT ON TABLE reactions IS 'Anonymous user reactions to cards';
COMMENT ON COLUMN reactions.reaction_type IS 'One of: thumbsup, fire, eyes, lightbulb';

-- Card views table: Analytics for card impressions
CREATE TABLE card_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    expanded BOOLEAN DEFAULT false,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE card_views IS 'Analytics tracking for card views';
COMMENT ON COLUMN card_views.expanded IS 'Whether the card was expanded to full view';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Columns indexes
CREATE INDEX idx_columns_position ON columns(position);
CREATE INDEX idx_columns_is_visible ON columns(is_visible);

-- Cards indexes
CREATE INDEX idx_cards_column_id ON cards(column_id);
CREATE INDEX idx_cards_column_position ON cards(column_id, position);
CREATE INDEX idx_cards_is_visible ON cards(is_visible);
CREATE INDEX idx_cards_card_type ON cards(card_type);
CREATE INDEX idx_cards_is_pinned ON cards(is_pinned);

-- Card-Tags indexes
CREATE INDEX idx_card_tags_card_id ON card_tags(card_id);
CREATE INDEX idx_card_tags_tag_id ON card_tags(tag_id);

-- Links indexes
CREATE INDEX idx_links_card_id ON links(card_id);

-- Reactions indexes
CREATE INDEX idx_reactions_card_id ON reactions(card_id);
CREATE INDEX idx_reactions_session_id ON reactions(session_id);
CREATE INDEX idx_reactions_created_at ON reactions(created_at);

-- Card views indexes
CREATE INDEX idx_card_views_card_id ON card_views(card_id);
CREATE INDEX idx_card_views_created_at ON card_views(created_at);
CREATE INDEX idx_card_views_session_id ON card_views(session_id);

-- Sessions indexes
CREATE INDEX idx_sessions_session_id ON sessions(session_id);
CREATE INDEX idx_sessions_fingerprint ON sessions(fingerprint);
CREATE INDEX idx_sessions_last_seen_at ON sessions(last_seen_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to columns table
CREATE TRIGGER update_columns_updated_at
    BEFORE UPDATE ON columns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to cards table
CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REALTIME
-- ============================================================================

-- Enable realtime for cards and reactions tables
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
