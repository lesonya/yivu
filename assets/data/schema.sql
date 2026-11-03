-- =========================================================================
-- YIVU: Local Offline-First Database Schema
-- Compatible with SQLite 3.x, Flutter Drift / sqflite, Android Room
-- =========================================================================

PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------------------
-- 1. PROFILES & MULTI-CHILD SETTINGS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS child_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    avatar_mascot TEXT NOT NULL DEFAULT 'mascot_blue_owl',
    grade_key TEXT NOT NULL, -- e.g. 'std_2', 'std_4', 'form_1', 'form_3'
    division TEXT NOT NULL CHECK(division IN ('standard', 'form')),
    total_xp INTEGER NOT NULL DEFAULT 0,
    total_stars INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- -------------------------------------------------------------------------
-- 2. GAMIFICATION, XP LOGS & LOCAL LEADERBOARD TRANSACTIONS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xp_transactions (
    id TEXT PRIMARY KEY NOT NULL,
    child_id TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK(amount > 0),
    stars_earned INTEGER NOT NULL DEFAULT 0,
    source_type TEXT NOT NULL CHECK(source_type IN ('MCQ_CORRECT', 'PAST_PAPER_COMPLETE', 'DAILY_STREAK', 'AI_CHALLENGE')),
    metadata TEXT, -- JSON blob for question_id or material_id reference
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_xp_child_created ON xp_transactions (child_id, created_at);

-- -------------------------------------------------------------------------
-- 3. CURRICULUM TAXONOMY & TOPICS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS curriculum_divisions (
    id TEXT PRIMARY KEY NOT NULL, -- 'standards', 'forms'
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY NOT NULL, -- e.g. 'std_math', 'form_integrated_science'
    division_id TEXT NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    icon TEXT NOT NULL,
    accent_color TEXT NOT NULL,
    FOREIGN KEY (division_id) REFERENCES curriculum_divisions(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------------------
-- 4. LEARNING MATERIALS (PRE-COMPILED & DYNAMICALLY UPLOADED)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_materials (
    id TEXT PRIMARY KEY NOT NULL,
    grade_key TEXT NOT NULL, -- 'std_2' .. 'std_7' or 'form_1' .. 'form_3'
    subject_id TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('PAST_PAPER_SAMPLE', 'NOTES_WITH_MCQ', 'AI_GENERATED_SET')),
    reading_content TEXT, -- Full markdown notes or summary
    is_precompiled INTEGER NOT NULL DEFAULT 1, -- 1 = bundled with APK, 0 = fetched/added later
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_materials_grade_subject ON learning_materials(grade_key, subject_id);

-- -------------------------------------------------------------------------
-- 5. MULTIPLE CHOICE QUESTIONS (MCQs) & FLASHCARDS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY NOT NULL,
    material_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    options_json TEXT NOT NULL, -- JSON array of strings e.g. '["Option A", "Option B", ...]'
    correct_index INTEGER NOT NULL CHECK(correct_index >= 0 AND correct_index <= 3),
    explanation TEXT NOT NULL,
    FOREIGN KEY (material_id) REFERENCES learning_materials(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_material ON questions(material_id);

-- -------------------------------------------------------------------------
-- 6. QUIZ ATTEMPTS & ANSWER AUDIT (FOR "EXPLAIN WITH AI")
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY NOT NULL,
    child_id TEXT NOT NULL,
    material_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    xp_awarded INTEGER NOT NULL,
    stars_awarded INTEGER NOT NULL,
    completed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (child_id) REFERENCES child_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES learning_materials(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    id TEXT PRIMARY KEY NOT NULL,
    attempt_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    selected_index INTEGER NOT NULL,
    is_correct INTEGER NOT NULL CHECK(is_correct IN (0, 1)),
    ai_explanation_cache TEXT, -- Cached ChatGPT response for "Explain with AI"
    FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------------------
-- 7. REUSABLE LEADERBOARD VIEWS
-- -------------------------------------------------------------------------

-- Household Weekly Leaderboard (Past 7 Days) for TV Dashboard
CREATE VIEW IF NOT EXISTS v_weekly_leaderboard AS
SELECT 
    p.id AS child_id,
    p.display_name,
    p.avatar_mascot,
    p.grade_key,
    p.division,
    COALESCE(SUM(x.amount), 0) AS weekly_xp,
    COALESCE(SUM(x.stars_earned), 0) AS weekly_stars,
    p.total_xp AS all_time_xp,
    p.total_stars AS all_time_stars
FROM child_profiles p
LEFT JOIN xp_transactions x 
    ON p.id = x.child_id 
    AND x.created_at >= (strftime('%s', 'now') - 604800) -- 7 days in seconds
GROUP BY p.id
ORDER BY weekly_xp DESC, all_time_xp DESC;

