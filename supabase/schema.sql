-- ====================================================================
-- KANCILCODE RELATIONAL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Edition: Kemendikdasmen & EdTech Competition Specification v2.0
-- Platform: Supabase PostgreSQL 16
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE level_category AS ENUM ('sequencing', 'loops', 'conditionals', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kancil_expression AS ENUM ('thinking', 'happy', 'encouraging', 'celebrating');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Zero-PII compliant for students)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(60) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_id VARCHAR(50) DEFAULT 'kancil_default',
    role user_role NOT NULL DEFAULT 'student',
    class_code VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Classrooms Table
CREATE TABLE IF NOT EXISTS public.classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    class_code VARCHAR(10) UNIQUE NOT NULL,
    grade_level INT DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Levels Table (Built-in + Teacher Generated via AI Level Generator)
CREATE TABLE IF NOT EXISTS public.levels (
    id SERIAL PRIMARY KEY,
    chapter_number INT NOT NULL,
    level_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    story_intro TEXT NOT NULL,
    category level_category NOT NULL,
    grid_size_x INT NOT NULL DEFAULT 8,
    grid_size_y INT NOT NULL DEFAULT 8,
    map_layout JSONB NOT NULL,
    kancil_start_pos JSONB NOT NULL,
    toolbox_xml TEXT NOT NULL,
    optimal_block_count INT NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chapter_number, level_number, created_by)
);

-- 6. User Progress Table (Stores student stars, attempts & offline sync status)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level_id INT NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
    status progress_status NOT NULL DEFAULT 'not_started',
    stars_earned INT DEFAULT 0 CHECK (stars_earned >= 0 AND stars_earned <= 3),
    saved_workspace_xml TEXT,
    attempts_count INT DEFAULT 0,
    time_spent_seconds INT DEFAULT 0,
    completed_at TIMESTAMPTZ,
    synced_from_offline BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, level_id)
);

-- 7. AI Socratic Hints & Interaction Logs
CREATE TABLE IF NOT EXISTS public.ai_hints_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level_id INT NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
    hint_tier INT NOT NULL CHECK (hint_tier BETWEEN 1 AND 3),
    ast_summary JSONB NOT NULL,
    student_error_state JSONB NOT NULL,
    ai_response_json JSONB NOT NULL,
    was_helpful BOOLEAN DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Row Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_hints_log ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles can be read by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles can be read by authenticated users" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- Classrooms Policies
DROP POLICY IF EXISTS "Classrooms can be viewed with class code" ON public.classrooms;
CREATE POLICY "Classrooms can be viewed with class code" ON public.classrooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers can manage classrooms" ON public.classrooms;
CREATE POLICY "Teachers can manage classrooms" ON public.classrooms FOR ALL USING (true);

-- Levels Policies
DROP POLICY IF EXISTS "Public levels are readable by everyone" ON public.levels;
CREATE POLICY "Public levels are readable by everyone" ON public.levels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers can insert custom levels" ON public.levels;
CREATE POLICY "Teachers can insert custom levels" ON public.levels FOR INSERT WITH CHECK (true);

-- User Progress Policies
DROP POLICY IF EXISTS "Users can manage own progress" ON public.user_progress;
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (true);

-- AI Hints Log Policies
DROP POLICY IF EXISTS "AI Hints log can be inserted" ON public.ai_hints_log;
CREATE POLICY "AI Hints log can be inserted" ON public.ai_hints_log FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Teachers can view classroom hint logs" ON public.ai_hints_log;
CREATE POLICY "Teachers can view classroom hint logs" ON public.ai_hints_log FOR SELECT USING (true);

-- 9. Seed Initial Data (Default Teacher & Class KANCIL4B)
INSERT INTO public.profiles (id, username, full_name, avatar_id, role, class_code)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'guru_ratna', 'Ibu Ratna Dewi, S.Pd.', 'kancil_smart', 'teacher', 'KANCIL4B')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.classrooms (id, teacher_id, name, class_code, grade_level)
VALUES 
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Kelas 4B - SDN Nusantara 01', 'KANCIL4B', 4)
ON CONFLICT (class_code) DO NOTHING;

