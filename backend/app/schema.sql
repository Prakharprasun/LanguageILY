-- =====================================================================
-- Duolingo clone - SQLite schema
--
-- Three groups of tables:
--   1. Course content  (courses -> units -> skills -> lessons -> exercises)
--   2. Learner state    (users, settings, sessions, answers, xp ledger)
--   3. Gamification     (achievements, quests and what each user unlocked)
--
-- Conventions
--   * Timestamps are ISO-8601 UTC strings ("2026-11-11T08:30:00+00:00"),
--     so plain string comparison sorts them correctly.
--   * Dates are "YYYY-MM-DD" (UTC, shifted by the simulated clock).
--   * Booleans are INTEGER 0/1 with CHECK constraints.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- App metadata (key/value). Holds the simulated clock offset.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- =====================================================================
-- 1. COURSE CONTENT
-- =====================================================================

CREATE TABLE IF NOT EXISTS courses (
    id              INTEGER PRIMARY KEY,
    language_code   TEXT NOT NULL UNIQUE,          -- 'es'
    title           TEXT NOT NULL,                 -- 'Spanish'
    flag_src        TEXT NOT NULL,                 -- '/es.svg'
    speech_locale   TEXT NOT NULL                  -- 'es-ES' (text-to-speech voice)
);

CREATE TABLE IF NOT EXISTS units (
    id          INTEGER PRIMARY KEY,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    position    INTEGER NOT NULL,                  -- 1-based order inside the course
    section     INTEGER NOT NULL DEFAULT 1,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    color       TEXT NOT NULL,                     -- theme key used by the UI: green|purple|blue|...
    UNIQUE (course_id, position)
);

-- A skill is one node on the learning path.
CREATE TABLE IF NOT EXISTS skills (
    id        INTEGER PRIMARY KEY,
    unit_id   INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    position  INTEGER NOT NULL,
    title     TEXT NOT NULL,
    icon      TEXT NOT NULL DEFAULT 'star',        -- star|book|dumbbell|chat|...
    UNIQUE (unit_id, position)
);

-- A skill is finished by completing all of its lessons ("Lesson 2 of 3").
CREATE TABLE IF NOT EXISTS lessons (
    id         INTEGER PRIMARY KEY,
    skill_id   INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    position   INTEGER NOT NULL,
    xp_reward  INTEGER NOT NULL DEFAULT 10 CHECK (xp_reward >= 0),
    UNIQUE (skill_id, position)
);

-- Vocabulary taught by a skill. Used for word hints (hover a word in a
-- prompt), the unit guidebook and the "words learned" statistic.
CREATE TABLE IF NOT EXISTS vocabulary (
    id           INTEGER PRIMARY KEY,
    skill_id     INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    term         TEXT NOT NULL,                    -- target language: 'la manzana'
    translation  TEXT NOT NULL,                    -- source language: 'the apple'
    image_src    TEXT,
    audio_src    TEXT,
    UNIQUE (skill_id, term)
);

CREATE TABLE IF NOT EXISTS exercises (
    id           INTEGER PRIMARY KEY,
    lesson_id    INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL,
    type         TEXT NOT NULL CHECK (type IN (
                     'MULTIPLE_CHOICE',   -- pick one option (image cards or text list)
                     'TRANSLATE',         -- build the sentence from a word bank
                     'MATCH_PAIRS',       -- tap matching term/translation pairs
                     'FILL_BLANK',        -- choose the word that fills "___"
                     'TYPE_ANSWER'        -- free text translation
                 )),
    prompt       TEXT NOT NULL,            -- question / sentence to translate / sentence with ___
    prompt_lang  TEXT NOT NULL CHECK (prompt_lang IN ('target', 'source')),
    solution     TEXT,                     -- canonical answer shown in the feedback bar
    translation  TEXT,                     -- optional context line (FILL_BLANK)
    UNIQUE (lesson_id, position)
);

-- Options for MULTIPLE_CHOICE / FILL_BLANK (is_correct), word-bank tiles for
-- TRANSLATE, and pairs for MATCH_PAIRS (text <-> match_text).
CREATE TABLE IF NOT EXISTS exercise_options (
    id           INTEGER PRIMARY KEY,
    exercise_id  INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL,
    text         TEXT NOT NULL,
    is_correct   INTEGER NOT NULL DEFAULT 0 CHECK (is_correct IN (0, 1)),
    match_text   TEXT,
    image_src    TEXT,
    audio_src    TEXT
);

-- Every accepted answer for free-text style exercises (TRANSLATE, TYPE_ANSWER).
CREATE TABLE IF NOT EXISTS exercise_accepted_answers (
    id           INTEGER PRIMARY KEY,
    exercise_id  INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    text         TEXT NOT NULL,
    UNIQUE (exercise_id, text)
);

-- =====================================================================
-- 2. LEARNER STATE
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    id                  INTEGER PRIMARY KEY,
    username            TEXT NOT NULL UNIQUE,
    display_name        TEXT NOT NULL,
    avatar_color        TEXT NOT NULL DEFAULT '#1CB0F6',
    created_at          TEXT NOT NULL,
    active_course_id    INTEGER REFERENCES courses(id) ON DELETE SET NULL,

    -- hearts regenerate lazily: on every read we add one heart per
    -- HEART_REGEN_MINUTES elapsed since hearts_updated_at
    hearts              INTEGER NOT NULL DEFAULT 5 CHECK (hearts >= 0),
    hearts_updated_at   TEXT NOT NULL,

    gems                INTEGER NOT NULL DEFAULT 500 CHECK (gems >= 0),

    streak_count        INTEGER NOT NULL DEFAULT 0 CHECK (streak_count >= 0),
    streak_last_date    TEXT,              -- last day that counted towards the streak
    longest_streak      INTEGER NOT NULL DEFAULT 0,
    streak_freezes      INTEGER NOT NULL DEFAULT 0 CHECK (streak_freezes >= 0),

    daily_goal_xp       INTEGER NOT NULL DEFAULT 20 CHECK (daily_goal_xp > 0)
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id                INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sound_effects          INTEGER NOT NULL DEFAULT 1 CHECK (sound_effects IN (0, 1)),
    animations             INTEGER NOT NULL DEFAULT 1 CHECK (animations IN (0, 1)),
    motivational_messages  INTEGER NOT NULL DEFAULT 1 CHECK (motivational_messages IN (0, 1)),
    listening_exercises    INTEGER NOT NULL DEFAULT 1 CHECK (listening_exercises IN (0, 1))
);

-- One attempt at a lesson (mode='lesson') or a practice round (mode='practice').
-- A lesson counts as completed for a user when a 'lesson' session for it is
-- 'completed'; skill progress is derived from this, never stored twice.
CREATE TABLE IF NOT EXISTS lesson_sessions (
    id            INTEGER PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id     INTEGER REFERENCES lessons(id) ON DELETE CASCADE,   -- NULL for global practice
    skill_id      INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    mode          TEXT NOT NULL CHECK (mode IN ('lesson', 'practice')),
    status        TEXT NOT NULL DEFAULT 'active'
                  -- failed = ran out of hearts, abandoned = a newer session was started
                  CHECK (status IN ('active', 'completed', 'failed', 'abandoned')),
    started_at    TEXT NOT NULL,
    completed_at  TEXT,
    mistakes      INTEGER NOT NULL DEFAULT 0,
    xp_earned     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_status ON lesson_sessions(user_id, status, mode);
CREATE INDEX IF NOT EXISTS idx_sessions_user_lesson ON lesson_sessions(user_id, lesson_id);

-- The exercises served in a session (practice sessions mix lessons).
CREATE TABLE IF NOT EXISTS session_exercises (
    session_id   INTEGER NOT NULL REFERENCES lesson_sessions(id) ON DELETE CASCADE,
    exercise_id  INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    position     INTEGER NOT NULL,
    PRIMARY KEY (session_id, exercise_id)
);

-- Every answer a learner submits (wrong answers included).
CREATE TABLE IF NOT EXISTS session_answers (
    id           INTEGER PRIMARY KEY,
    session_id   INTEGER NOT NULL REFERENCES lesson_sessions(id) ON DELETE CASCADE,
    exercise_id  INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    answer       TEXT NOT NULL,
    is_correct   INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
    answered_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_answers_session ON session_answers(session_id, exercise_id);

-- XP ledger: append-only, one row per XP grant. Total XP, today's XP
-- (daily goal), weekly league XP and the streak calendar are all derived here.
CREATE TABLE IF NOT EXISTS xp_events (
    id          INTEGER PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id  INTEGER REFERENCES lesson_sessions(id) ON DELETE SET NULL,
    amount      INTEGER NOT NULL CHECK (amount > 0),
    source      TEXT NOT NULL CHECK (source IN ('lesson', 'practice', 'bonus', 'seed')),
    created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_xp_user_time ON xp_events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_xp_time ON xp_events(created_at);

-- =====================================================================
-- 3. GAMIFICATION
-- =====================================================================

-- Tiered achievements: rows with the same family are levels of one badge
-- (e.g. Wildfire level 1 = 3 day streak, level 2 = 7 day streak ...).
CREATE TABLE IF NOT EXISTS achievements (
    id          INTEGER PRIMARY KEY,
    family      TEXT NOT NULL,                     -- 'wildfire'
    level       INTEGER NOT NULL,
    title       TEXT NOT NULL,                     -- 'Wildfire'
    description TEXT NOT NULL,                     -- 'Reach a 3 day streak'
    metric      TEXT NOT NULL CHECK (metric IN (
                    'streak', 'total_xp', 'lessons', 'perfect_lessons', 'skills', 'words')),
    threshold   INTEGER NOT NULL CHECK (threshold > 0),
    color       TEXT NOT NULL,
    UNIQUE (family, level)
);

CREATE TABLE IF NOT EXISTS user_achievements (
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id  INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at     TEXT NOT NULL,
    PRIMARY KEY (user_id, achievement_id)
);

-- Daily quests (content), progress is derived from today's activity.
CREATE TABLE IF NOT EXISTS quests (
    id          INTEGER PRIMARY KEY,
    code        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    metric      TEXT NOT NULL CHECK (metric IN ('xp_today', 'lessons_today', 'perfect_today')),
    target      INTEGER NOT NULL CHECK (target > 0),
    gem_reward  INTEGER NOT NULL DEFAULT 0
);

-- Records that a user already received the reward for a quest on a given day.
CREATE TABLE IF NOT EXISTS user_quest_rewards (
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id    INTEGER NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    quest_date  TEXT NOT NULL,
    claimed_at  TEXT NOT NULL,
    PRIMARY KEY (user_id, quest_id, quest_date)
);
