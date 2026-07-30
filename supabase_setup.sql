-- ============================================================================
-- Unified Supabase Database Setup & Seed Script
-- Project: advaith_portfolio
-- Target Supabase Project ID: eiqarsxvxfxbcjakaeqk
-- Instructions: Copy this entire script, open the Supabase SQL Editor for your
--               project, paste it into a New Query, and click "Run".
-- ============================================================================

-- ============================================================================
-- 1. ENUM TYPES & EXTENSIONS
-- ============================================================================

CREATE TYPE card_type AS ENUM (
    'experience',
    'project',
    'skill',
    'education',
    'about'
);

CREATE TYPE link_type AS ENUM (
    'github',
    'demo',
    'article',
    'external'
);

CREATE TYPE tag_category AS ENUM (
    'language',
    'framework',
    'database',
    'tool',
    'platform',
    'concept'
);

-- ============================================================================
-- 2. TABLES CREATION
-- ============================================================================

-- Personal Info table (Stores profile data for AboutPanel)
CREATE TABLE IF NOT EXISTS public.personal_info (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    location TEXT,
    professional_summary TEXT,
    profile_image_url TEXT,
    github_url TEXT,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.personal_info IS 'Stores personal profile information displayed in the AboutPanel';

-- Columns table (Kanban columns)
CREATE TABLE IF NOT EXISTS public.columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    position INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.columns IS 'Board columns for organizing cards';

-- Cards table (Kanban cards)
CREATE TABLE IF NOT EXISTS public.cards (
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

COMMENT ON TABLE public.cards IS 'Content cards displayed on the board';

-- Tags table (Categories)
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category tag_category,
    color TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.tags IS 'Tags for categorizing and filtering cards';

-- Card-Tags junction table (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.card_tags (
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (card_id, tag_id)
);

COMMENT ON TABLE public.card_tags IS 'Junction table for card-tag relationships';

-- Links table (External links)
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    link_type link_type DEFAULT 'external',
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.links IS 'External links associated with cards';

-- Sessions table (Analytics sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    fingerprint TEXT,
    display_name TEXT,
    user_agent TEXT,
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.sessions IS 'Anonymous visitor sessions for reactions and analytics';

-- Reactions table (Anonymous visitor reactions)
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('thumbsup', 'fire', 'eyes', 'lightbulb')),
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(card_id, session_id, reaction_type)
);

COMMENT ON TABLE public.reactions IS 'Anonymous user reactions to cards';

-- Card Views table (Impression analytics)
CREATE TABLE IF NOT EXISTS public.card_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    expanded BOOLEAN DEFAULT false,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.card_views IS 'Analytics tracking for card views';

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(position);
CREATE INDEX IF NOT EXISTS idx_columns_is_visible ON columns(is_visible);
CREATE INDEX IF NOT EXISTS idx_cards_column_id ON cards(column_id);
CREATE INDEX IF NOT EXISTS idx_cards_column_position ON cards(column_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_is_visible ON cards(is_visible);
CREATE INDEX IF NOT EXISTS idx_cards_card_type ON cards(card_type);
CREATE INDEX IF NOT EXISTS idx_cards_is_pinned ON cards(is_pinned);
CREATE INDEX IF NOT EXISTS idx_card_tags_card_id ON card_tags(card_id);
CREATE INDEX IF NOT EXISTS idx_card_tags_tag_id ON card_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_links_card_id ON links(card_id);
CREATE INDEX IF NOT EXISTS idx_reactions_card_id ON reactions(card_id);
CREATE INDEX IF NOT EXISTS idx_reactions_session_id ON reactions(session_id);
CREATE INDEX IF NOT EXISTS idx_reactions_created_at ON reactions(created_at);
CREATE INDEX IF NOT EXISTS idx_card_views_card_id ON card_views(card_id);
CREATE INDEX IF NOT EXISTS idx_card_views_created_at ON card_views(created_at);
CREATE INDEX IF NOT EXISTS idx_card_views_session_id ON card_views(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_fingerprint ON sessions(fingerprint);
CREATE INDEX IF NOT EXISTS idx_sessions_last_seen_at ON sessions(last_seen_at);

-- ============================================================================
-- 4. TIMESTAMPTZ UPDATE TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_columns_updated_at
    BEFORE UPDATE ON columns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. REALTIME CHANNELS
-- ============================================================================

-- Enable Supabase Realtime for cards and reactions
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;

-- ============================================================================
-- 6. SECURITY FUNCTIONS (Row Level Security Helpers)
-- ============================================================================

-- Check if session exists and is recent (within 30 days)
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

-- Check if the current client role is authenticated (Admin dashboard)
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.role() = 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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

-- Check if a card is visible
CREATE OR REPLACE FUNCTION is_card_visible(p_card_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_visible BOOLEAN;
    v_column_id UUID;
BEGIN
    SELECT is_visible, column_id INTO v_is_visible, v_column_id
    FROM cards
    WHERE id = p_card_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    IF NOT v_is_visible THEN
        RETURN FALSE;
    END IF;

    RETURN is_column_visible(v_column_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Rate limiting reactions
CREATE OR REPLACE FUNCTION can_session_react(p_session_id TEXT, p_card_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    recent_reaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_reaction_count
    FROM reactions
    WHERE session_id = p_session_id
    AND created_at > NOW() - INTERVAL '1 hour';

    RETURN recent_reaction_count < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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

-- Grant permissions for execute
GRANT EXECUTE ON FUNCTION is_valid_session TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_authenticated TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_card_visible TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_column_visible TO anon, authenticated;
GRANT EXECUTE ON FUNCTION can_session_react TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_card_reaction_counts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_card_view_count TO anon, authenticated;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- PERSONAL INFO
ALTER TABLE personal_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_profile" ON personal_info FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "authenticated_modify_profile" ON personal_info FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- COLUMNS
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_visible_columns" ON columns FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "authenticated_all_columns" ON columns FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CARDS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_visible_cards" ON cards FOR SELECT TO anon USING (is_visible = true AND is_column_visible(column_id));
CREATE POLICY "authenticated_all_cards" ON cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- TAGS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_tags" ON tags FOR SELECT TO anon USING (true);
CREATE POLICY "authenticated_all_tags" ON tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CARD_TAGS
ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_card_tags" ON card_tags FOR SELECT TO anon USING (is_card_visible(card_id));
CREATE POLICY "authenticated_all_card_tags" ON card_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- LINKS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_links" ON links FOR SELECT TO anon USING (is_card_visible(card_id));
CREATE POLICY "authenticated_all_links" ON links FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SESSIONS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_sessions" ON sessions FOR INSERT TO anon WITH CHECK (length(session_id) >= 32 AND length(session_id) <= 64);
CREATE POLICY "public_update_sessions" ON sessions FOR UPDATE TO anon USING (true) WITH CHECK (length(session_id) >= 32 AND length(session_id) <= 64);
CREATE POLICY "authenticated_all_sessions" ON sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- REACTIONS
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_reactions" ON reactions FOR SELECT TO anon USING (is_card_visible(card_id));
CREATE POLICY "public_insert_reactions" ON reactions FOR INSERT TO anon WITH CHECK (is_card_visible(card_id) AND is_valid_session(session_id) AND can_session_react(session_id, card_id));
CREATE POLICY "authenticated_all_reactions" ON reactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CARD_VIEWS
ALTER TABLE card_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_card_views" ON card_views FOR INSERT TO anon WITH CHECK (is_card_visible(card_id) AND session_id IS NOT NULL AND length(session_id) >= 32);
CREATE POLICY "authenticated_all_card_views" ON card_views FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- 8. STORAGE BUCKET setup
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resumes', 'resumes', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public read access for resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Service role write access for resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'service_role');
CREATE POLICY "Service role delete access for resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.role() = 'service_role');

-- ============================================================================
-- 9. SEED DATA - ADVAITH RENJITH PROFILE
-- ============================================================================

-- Personal Profile Info
INSERT INTO public.personal_info (id, full_name, title, email, phone, linkedin_url, location, professional_summary, profile_image_url, github_url, resume_url) VALUES
    (
        1,
        'Advaith Renjith',
        'Full-Stack Developer & App Architect',
        'advaithanjanarenjith@gmail.com',
        NULL,
        'https://linkedin.com/in/advaith-renjith',
        'Trivandrum, India',
        'Final-year Electrical and Computer Engineering student specializing in building responsive web applications and designing robust application architectures. Gained extensive hands-on experience in modern frontend development, REST APIs, and database design during my internship at Tachlog Pvt Ltd.',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        'https://github.com/advaith-renjith-2004',
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- Kanban Columns
INSERT INTO columns (id, title, slug, position, is_visible) VALUES
    ('11111111-1111-1111-1111-111111111111', 'About', 'about', 0, true),
    ('22222222-2222-2222-2222-222222222222', 'Experience', 'experience', 1, true),
    ('33333333-3333-3333-3333-333333333333', 'Projects', 'projects', 2, true),
    ('44444444-4444-4444-4444-444444444444', 'Skills', 'skills', 3, true),
    ('55555555-5555-5555-5555-555555555555', 'Education', 'education', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Tags (Tech stack labels)
INSERT INTO tags (id, name, slug, category, color) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'TypeScript', 'typescript', 'language', '#3178C6'),
    ('a2222222-2222-2222-2222-222222222222', 'JavaScript', 'javascript', 'language', '#F7DF1E'),
    ('a3333333-3333-3333-3333-333333333333', 'Python', 'python', 'language', '#3776AB'),
    ('a4444444-4444-4444-4444-444444444444', 'Go', 'go', 'language', '#00ADD8'),
    ('a5555555-5555-5555-5555-555555555555', 'HTML/CSS', 'html-css', 'language', '#E34F26'),
    ('b1111111-1111-1111-1111-111111111111', 'React', 'react', 'framework', '#61DAFB'),
    ('b2222222-2222-2222-2222-222222222222', 'Next.js', 'nextjs', 'framework', '#000000'),
    ('b3333333-3333-3333-3333-333333333333', 'Node.js', 'nodejs', 'framework', '#339933'),
    ('b4444444-4444-4444-4444-444444444444', 'FastAPI', 'fastapi', 'framework', '#009688'),
    ('b5555555-5555-5555-5555-555555555555', 'Tailwind CSS', 'tailwindcss', 'framework', '#06B6D4'),
    ('c1111111-1111-1111-1111-111111111111', 'PostgreSQL', 'postgresql', 'database', '#4169E1'),
    ('c2222222-2222-2222-2222-222222222222', 'SQLite', 'sqlite', 'database', '#003B57'),
    ('c3333333-3333-3333-3333-333333333333', 'Supabase', 'supabase-db', 'database', '#3FCF8E'),
    ('d1111111-1111-1111-1111-111111111111', 'Docker', 'docker', 'tool', '#2496ED'),
    ('d2222222-2222-2222-2222-222222222222', 'Git', 'git', 'tool', '#F05032'),
    ('d3333333-3333-3333-3333-333333333333', 'VS Code', 'vscode', 'tool', '#007ACC'),
    ('f1111111-1111-1111-1111-111111111111', 'REST APIs', 'rest-apis', 'concept', '#6366F1'),
    ('f2222222-2222-2222-2222-222222222222', 'App Architecture', 'app-architecture', 'concept', '#8B5CF6'),
    ('f3333333-3333-3333-3333-333333333333', 'RAG / AI Search', 'rag-ai-search', 'concept', '#00E676'),
    ('tag-kotlin-id-00000000000000', 'Kotlin', 'kotlin', 'language', '#7F52FF'),
    ('tag-dart-id-0000000000000000', 'Dart', 'dart', 'language', '#00B4AB')
ON CONFLICT (id) DO NOTHING;

-- About Card
INSERT INTO cards (id, column_id, card_type, position, title, subtitle, preview_text, full_content, is_pinned) VALUES
    (
        'ca111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'about',
        0,
        'Welcome to My Portfolio',
        'College Student & Dev',
        'Final-year Electrical and Computer Engineering student interested in Web Development and Application Architecture.',
        E'# About Me\n\nI''m a passionate final-year Electrical and Computer Engineering student going into my senior year at Mar Baselios College of Engineering and Technology (Autonomous). I enjoy coding, designing clean UI layouts, and structuring robust application architectures.\n\n## My Journey\n- **Internship at Tachlog Pvt Ltd**: Gained hands-on experience building web apps and understanding end-to-end application architecture.\n- **B.Tech Studies**: Currently focusing on software engineering, database design, and embedded systems.\n\n## Tech & Frameworks I''m Exploring\n- **Agentic AI & ML Systems**: Experimenting with local LLM deployments, NVIDIA NIM, and Google Gemini / Antigravity integrations.\n- **Modern Web Architectures**: Digging deeper into real-time synchronization with Supabase, Next.js server-side rendering, and performant state management.\n- **Systems & Cross-Platform Development**: Expanding my programming toolkit with Rust and refining mobile application structures in Kotlin and Dart.\n\n## Outside of Code\n- **Tech Tinkering**: Building custom automation scripts, setting up local home lab servers, and configuring optimized developer environments.\n- **Creative Focus**: Exploring modern UI/UX design trends (such as warm minimalist sand-and-charcoal interfaces, tactile HUD designs, and smooth motion curves).\n- **Hobbies**: Avid reader of engineering blogs, gaming, and exploring electronics hardware integration.\n\nFeel free to interact with my project board to explore my background!',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- Experience Card (Tachlog)
INSERT INTO cards (id, column_id, card_type, position, title, subtitle, date_start, date_end, preview_text, full_content, metadata) VALUES
    (
        'ca222222-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        'experience',
        0,
        'Full-Stack Developer Intern',
        'Tachlog Pvt Ltd',
        '2026-05-25',
        '2026-06-28',
        'Gained extensive knowledge in creating applications, designing components, and architecting database backends.',
        E'## Internship at Tachlog Pvt Ltd\n\nDuring my internship, I worked as a Full-Stack Developer where I participated in building web applications from scratch.\n\n### Key Learnings & Tasks\n- **Application Architecture**: Learned how to structure modular frontend routes and separate logic into clean services.\n- **Backend & Database**: Wrote SQL queries, designed relational schemas in PostgreSQL, and set up REST API endpoints using Express.\n- **Frontend Build**: Developed interactive, responsive dashboards using React and Tailwind CSS.\n- **Version Control**: Practiced Git workflows, code reviews, and basic package management.',
        '{"company_size": "10-50", "skills_learned": ["Express", "PostgreSQL", "React", "Architecture"]}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- Project Cards
INSERT INTO cards (id, column_id, card_type, position, title, subtitle, preview_text, full_content, thumbnail_url, is_pinned) VALUES
    (
        'ca333333-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333333',
        'project',
        0,
        'Cinematic Interactive Portfolio',
        'advaith_portfolio',
        'An interactive board-style portfolio styled with warm editorial aesthetics, canvas particles, a custom cursor, and Supabase integration.',
        E'# Cinematic Interactive Portfolio\n\nThis very website! A digital resume presented as an interactive board layout.\n\n## Tech Stack\n- **Framework**: Next.js 14 (App Router)\n- **Database**: Supabase (PostgreSQL + real-time reactions)\n- **Animations**: Framer Motion for board layouts\n- **Aesthetics**: Warm cream background canvas, custom cursor, and dynamic layout directions.',
        NULL,
        true
    ),
    (
        'ca333333-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'project',
        1,
        'Cortex Enterprise',
        'Cortex-Enterprise',
        'Cortex Enterprise is a local, voice-activated AI search engine for mini-ERPs powered by NVIDIA NIM and PostgreSQL.',
        E'# Cortex Enterprise\n\nCortex Enterprise is a local, voice-activated AI search engine for mini-ERPs. Powered by NVIDIA NIM and PostgreSQL, it unifies cross-departmental data—from HR and accounts to circuit testing and mechanics—into a secure neural network, allowing instant data retrieval through low-latency speech recognition.',
        NULL,
        false
    ),
    (
        'ca333333-3333-3333-3333-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'project',
        2,
        'EV Fleet Manager',
        'EV-app',
        'A complete, real-world prototype for managing and tracking an Electric Vehicle (EV) commercial fleet.',
        E'# EV Fleet Manager\n\nA complete, real-world prototype for managing and tracking an Electric Vehicle (EV) commercial fleet.\n\n## Features\n- **Fleet Telemetry**: Real-time fleet tracking and battery monitoring.\n- **Optimized Scheduling**: Smart routing and charging calculations.',
        NULL,
        false
    ),
    (
        'ca333333-4444-4444-4444-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'project',
        3,
        'Kinetix Focus Automation',
        'Kinetix',
        'Kinetix is a privacy-first mobile utility that dynamically adapts your phone''s focus mode to your environment.',
        E'# Kinetix\n\nKinetix is a privacy-first mobile utility that dynamically adapts your phone''s focus mode to your environment. Using native hardware sensors, ambient audio metering, and Wi-Fi anchors, it automates notifications and device states with zero user intervention and optimized battery consumption. All processing happens entirely on-device.',
        NULL,
        false
    ),
    (
        'ca333333-5555-5555-5555-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'project',
        4,
        'Memory Box Reminders',
        'memory_box',
        'A reminder app built specially for giving location based reminder system.',
        E'# Memory Box\n\nA reminder app built specially for giving location based reminder system.\n\n## Features\n- **Location Triggers**: Set task reminders that trigger upon entering geofenced areas.\n- **On-Device Geocoding**: Local task alarms designed to save battery.',
        NULL,
        false
    ),
    (
        'ca333333-6666-6666-6666-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'project',
        5,
        'SubZero Spending Console',
        'subzero_website',
        'SubZero is a subscription management console built to solve hidden monthly leaks.',
        E'# SubZero\n\nSubZero is a subscription management console built to solve a simple problem: hidden monthly leaks. It gives you an active, real-time look at your monthly spend and annual burn rate in a clean, HUD-style dashboard. Beyond telemetry, SubZero helps you take action with pre-loaded cancellation routes.',
        NULL,
        false
    ),
    (
        'ca333333-7777-7777-7777-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'project',
        6,
        'VibeShift Music Discovery',
        'vibeshift_music',
        'A visual music discovery platform where users interact with a digital canvas to generate Spotify playlists matching their mood.',
        E'# VibeShift Music\n\nA visual music discovery platform where users interact with a digital canvas to adjust energy, weather, and colors. The app translates these aesthetic choices into Spotify API audio metrics to generate custom, playable playlists matching their mood.',
        NULL,
        false
    )
ON CONFLICT (id) DO NOTHING;

-- Skill Cards
INSERT INTO cards (id, column_id, card_type, position, title, subtitle, preview_text, full_content) VALUES
    (
        'ca444444-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444444',
        'skill',
        0,
        'Frontend & UI Development',
        'React, Next.js, Tailwind CSS',
        'Building clean, modern, and interactive interfaces with responsive grids.',
        E'## Frontend Competencies\n\n- **React / Next.js**: Component lifecycle, hooks, page routing.\n- **Styling**: Tailwind CSS, CSS Flexbox/Grid, responsive styles.\n- **State Management**: Zustand and React Context.'
    ),
    (
        'ca444444-2222-2222-2222-222222222222',
        '44444444-4444-4444-4444-444444444444',
        'skill',
        1,
        'Backend & Databases',
        'Node.js, PostgreSQL, Supabase',
        'Writing API servers, designing relational database tables, and implementing RLS policies.',
        E'## Backend Competencies\n\n- **Node.js + Express**: Building server logic and routing endpoints.\n- **PostgreSQL / SQL**: Structuring relational tables, indexing, and foreign key relations.\n- **Supabase**: Relational storage, database clients, and authentication middleware.'
    ),
    (
        'ca444444-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        'skill',
        2,
        'Development Tools',
        'Git, GitHub, VS Code',
        'Version control, package management, and developer environment tooling.',
        E'## Tools & Workflows\n\n- **Git & GitHub**: Branching, commits, pull requests, and version history.\n- **VS Code**: Custom workspace setups and extensions.'
    )
ON CONFLICT (id) DO NOTHING;

-- Education Card
INSERT INTO cards (id, column_id, card_type, position, title, subtitle, date_start, date_end, preview_text, full_content) VALUES
    (
        'ca555555-1111-1111-1111-111111111111',
        '55555555-5555-5555-5555-555555555555',
        'education',
        0,
        'B.Tech in Electrical and Computer Engineering',
        'Mar Baselios College of Engineering and Technology (Autonomous)',
        '2023-09-01',
        '2027-06-30',
        'Final-year student specializing in ECE. Focusing on hardware systems, digital circuits, and computer architecture.',
        E'## Bachelor of Technology in Electrical and Computer Engineering\n\n- **Status**: Entering Final Year (Current student)\n- **College**: Mar Baselios College of Engineering and Technology (Autonomous)\n- **Key Coursework**: Computer Architecture, Digital Electronics, Signals and Systems, Microprocessors & Microcontrollers, Web Systems, and Databases.'
    )
ON CONFLICT (id) DO NOTHING;

-- Card-Tags Associations
INSERT INTO card_tags (card_id, tag_id) VALUES
    ('ca111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'), -- TypeScript
    ('ca111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111'), -- React
    ('ca111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222'), -- Next.js
    ('ca222222-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111'), -- React
    ('ca222222-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333'), -- Node.js
    ('ca222222-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'), -- PostgreSQL
    ('ca222222-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222'), -- App Architecture
    ('ca333333-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222'), -- Next.js
    ('ca333333-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333'), -- Supabase
    ('ca333333-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555'), -- Tailwind CSS
    ('ca333333-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'), -- TypeScript
    ('ca333333-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111'), -- PostgreSQL
    ('ca333333-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'), -- JavaScript
    ('ca333333-3333-3333-3333-222222222222', 'tag-dart-id-0000000000000000'), -- Dart
    ('ca333333-4444-4444-4444-222222222222', 'tag-kotlin-id-00000000000000'), -- Kotlin
    ('ca333333-5555-5555-5555-222222222222', 'tag-dart-id-0000000000000000'), -- Dart
    ('ca333333-6666-6666-6666-222222222222', 'a2222222-2222-2222-2222-222222222222'), -- JavaScript
    ('ca333333-7777-7777-7777-222222222222', 'a2222222-2222-2222-2222-222222222222')  -- JavaScript
ON CONFLICT (card_id, tag_id) DO NOTHING;

-- Links
INSERT INTO links (id, card_id, label, url, link_type, position) VALUES
    ('11111111-1111-1111-1111-111111111111', 'ca333333-1111-1111-1111-111111111111', 'GitHub', 'https://github.com/advaith-renjith-2004/advaith_portfolio', 'github', 0),
    ('11111111-1111-1111-1111-111111111112', 'ca333333-1111-1111-1111-111111111111', 'Explore', 'https://advaith-portfolio-nine.vercel.app/', 'demo', 1),
    ('22222222-2222-2222-2222-222222222222', 'ca333333-2222-2222-2222-222222222222', 'GitHub', 'https://github.com/advaith-renjith-2004/Cortex-Enterprise', 'github', 0),
    ('22222222-2222-2222-2222-222222222223', 'ca333333-2222-2222-2222-222222222222', 'Explore', 'https://cortex-enterprise-two.vercel.app/', 'demo', 1),
    ('33333333-3333-3333-3333-333333333333', 'ca333333-3333-3333-3333-222222222222', 'GitHub', 'https://github.com/advaith-renjith-2004/EV-app', 'github', 0),
    ('33333333-3333-3333-3333-333333333334', 'ca333333-3333-3333-3333-222222222222', 'Explore', 'https://ev-fleet-advaith-2026.web.app/', 'demo', 1),
    ('44444444-4444-4444-4444-444444444444', 'ca333333-4444-4444-4444-222222222222', 'GitHub', 'https://github.com/advaith-renjith-2004/Kinetix', 'github', 0),
    ('44444444-4444-4444-4444-444444444445', 'ca333333-4444-4444-4444-222222222222', 'Explore', 'https://kinetix-woad.vercel.app/', 'demo', 1),
    ('55555555-5555-5555-5555-555555555555', 'ca333333-5555-5555-5555-222222222222', 'GitHub', 'https://github.com/advaith-renjith-2004/memory_box', 'github', 0),
    ('55555555-5555-5555-5555-555555555556', 'ca333333-5555-5555-5555-222222222222', 'Explore', 'https://learning101advaith-3a197.web.app/', 'demo', 1),
    ('66666666-6666-6666-6666-666666666666', 'ca333333-6666-6666-6666-222222222222', 'GitHub', 'https://github.com/advaith-renjith-2004/subzero_website', 'github', 0),
    ('66666666-6666-6666-6666-666666666667', 'ca333333-6666-6666-6666-222222222222', 'Explore', 'https://subzero-website-kappa.vercel.app/', 'demo', 1),
    ('77777777-7777-7777-7777-777777777777', 'ca333333-7777-7777-7777-222222222222', 'GitHub', 'https://github.com/advaith-renjith-2004/vibeshift_music', 'github', 0),
    ('77777777-7777-7777-7777-777777777778', 'ca333333-7777-7777-7777-222222222222', 'Explore', 'https://vibeshift-music-4q94-pi.vercel.app/', 'demo', 1)
ON CONFLICT (id) DO NOTHING;

