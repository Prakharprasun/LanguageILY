"""Database seeder.

Builds all 5 exercise types (`MULTIPLE_CHOICE`, `TRANSLATE`, `MATCH_PAIRS`,
`FILL_BLANK`, `TYPE_ANSWER`) for every lesson in the course and populates a
sample learner with initial progress, a 5-day streak, XP history, and rival
learners on the leaderboard so the app is immediately rich and playable.
"""

import random
import re
import sqlite3
from datetime import timedelta

from app import clock, db
from app.services import gamification
from seed.content import (
    ACHIEVEMENTS,
    COURSE,
    KOREAN_COURSE,
    KOREAN_UNITS,
    LEARNER,
    LESSONS_PER_SKILL,
    QUESTS,
    RIVALS,
    UNITS,
)

_WORD_SPLIT = re.compile(r"[¿?¡!.,;:\"“”'’«»()\-]+")


def _clean_words(sentence: str) -> list[str]:
    words = []
    for token in sentence.split():
        cleaned = _WORD_SPLIT.sub("", token)
        if cleaned:
            words.append(cleaned)
    return words


def _add_exercise(
    conn: sqlite3.Connection,
    lesson_id: int,
    position: int,
    ex_type: str,
    prompt: str,
    prompt_lang: str,
    solution: str | None = None,
    translation: str | None = None,
) -> int:
    cur = conn.execute(
        """INSERT INTO exercises (lesson_id, position, type, prompt, prompt_lang, solution, translation)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (lesson_id, position, ex_type, prompt, prompt_lang, solution, translation),
    )
    return cur.lastrowid


def _build_lesson_exercises(
    conn: sqlite3.Connection,
    lesson_id: int,
    lesson_idx: int,
    vocab: list[tuple],
    sentences: list,
    rng: random.Random,
) -> None:
    """Creates 6 varied exercises covering all 5 required exercise types."""
    pos = 1

    # Rotate vocab & sentences based on lesson_idx so Lesson 1 and Lesson 2 feel distinct
    v_offset = (lesson_idx * 2) % len(vocab)
    rotated_vocab = vocab[v_offset:] + vocab[:v_offset]

    s_offset = (lesson_idx * 2) % len(sentences)
    rotated_sentences = sentences[s_offset:] + sentences[:s_offset]

    # 1. MULTIPLE_CHOICE (pick the target translation for a source concept, with image/audio if present)
    target_v = rotated_vocab[0]
    distractors = [v for v in rotated_vocab[1:] if v[0] != target_v[0]][:2]
    mc_options = [target_v] + distractors
    rng.shuffle(mc_options)
    ex_id = _add_exercise(
        conn,
        lesson_id,
        pos,
        "MULTIPLE_CHOICE",
        f'Which one of these is "{target_v[1]}"?',
        "source",
        solution=target_v[0],
    )
    for opt_pos, opt in enumerate(mc_options, start=1):
        conn.execute(
            """INSERT INTO exercise_options
               (exercise_id, position, text, is_correct, image_src, audio_src)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (ex_id, opt_pos, opt[0], int(opt[0] == target_v[0]), opt[2], opt[3]),
        )
    pos += 1

    # 2. TRANSLATE (word bank: Spanish -> English)
    sent1 = rotated_sentences[0]
    ex_id = _add_exercise(
        conn,
        lesson_id,
        pos,
        "TRANSLATE",
        sent1.es,
        "target",
        solution=sent1.en,
    )
    for alt in [sent1.en] + sent1.en_alt:
        conn.execute(
            "INSERT OR IGNORE INTO exercise_accepted_answers (exercise_id, text) VALUES (?, ?)",
            (ex_id, alt),
        )
    correct_tiles = _clean_words(sent1.en)
    # Distractor English words from vocab
    en_pool = [w for v in vocab for w in _clean_words(v[1]) if w.lower() not in {t.lower() for t in correct_tiles}]
    rng.shuffle(en_pool)
    tiles = correct_tiles + en_pool[:3]
    rng.shuffle(tiles)
    for t_pos, tile in enumerate(tiles, start=1):
        conn.execute(
            "INSERT INTO exercise_options (exercise_id, position, text) VALUES (?, ?, ?)",
            (ex_id, t_pos, tile),
        )
    pos += 1

    # 3. MATCH_PAIRS (tap matching Spanish <-> English pairs)
    pair_items = rotated_vocab[:5]
    ex_id = _add_exercise(
        conn,
        lesson_id,
        pos,
        "MATCH_PAIRS",
        "Tap the matching pairs",
        "source",
    )
    for p_pos, item in enumerate(pair_items, start=1):
        conn.execute(
            """INSERT INTO exercise_options
               (exercise_id, position, text, match_text, is_correct, audio_src)
               VALUES (?, ?, ?, ?, 1, ?)""",
            (ex_id, p_pos, item[0], item[1], item[3]),
        )
    pos += 1

    # 4. FILL_BLANK (complete the Spanish sentence with the missing word)
    sent2 = rotated_sentences[1 % len(rotated_sentences)]
    blank_word, blank_distractors = sent2.blank
    blanked_prompt = re.sub(re.escape(blank_word), "___", sent2.es, count=1)
    if "___" not in blanked_prompt:
        blanked_prompt = f"{sent2.es} (___)"
    ex_id = _add_exercise(
        conn,
        lesson_id,
        pos,
        "FILL_BLANK",
        blanked_prompt,
        "target",
        solution=sent2.es,
        translation=sent2.en,
    )
    fb_choices = [(blank_word, True)] + [(d, False) for d in blank_distractors]
    rng.shuffle(fb_choices)
    for c_pos, (choice_text, is_corr) in enumerate(fb_choices, start=1):
        conn.execute(
            """INSERT INTO exercise_options (exercise_id, position, text, is_correct)
               VALUES (?, ?, ?, ?)""",
            (ex_id, c_pos, choice_text, int(is_corr)),
        )
    pos += 1

    # 5. TRANSLATE (word bank: English -> Spanish)
    sent3 = rotated_sentences[2 % len(rotated_sentences)]
    ex_id = _add_exercise(
        conn,
        lesson_id,
        pos,
        "TRANSLATE",
        sent3.en,
        "source",
        solution=sent3.es,
    )
    for alt in [sent3.es] + sent3.es_alt:
        conn.execute(
            "INSERT OR IGNORE INTO exercise_accepted_answers (exercise_id, text) VALUES (?, ?)",
            (ex_id, alt),
        )
    es_tiles = _clean_words(sent3.es)
    es_pool = [w for v in vocab for w in _clean_words(v[0]) if w.lower() not in {t.lower() for t in es_tiles}]
    rng.shuffle(es_pool)
    tiles_es = es_tiles + es_pool[:3]
    rng.shuffle(tiles_es)
    for t_pos, tile in enumerate(tiles_es, start=1):
        conn.execute(
            "INSERT INTO exercise_options (exercise_id, position, text) VALUES (?, ?, ?)",
            (ex_id, t_pos, tile),
        )
    pos += 1

    # 6. TYPE_ANSWER (free-text translation)
    sent4 = rotated_sentences[3 % len(rotated_sentences)]
    if lesson_idx % 2 == 0:
        # Type in English
        ex_id = _add_exercise(
            conn,
            lesson_id,
            pos,
            "TYPE_ANSWER",
            sent4.es,
            "target",
            solution=sent4.en,
        )
        for alt in [sent4.en] + sent4.en_alt:
            conn.execute(
                "INSERT OR IGNORE INTO exercise_accepted_answers (exercise_id, text) VALUES (?, ?)",
                (ex_id, alt),
            )
    else:
        # Type in Spanish
        ex_id = _add_exercise(
            conn,
            lesson_id,
            pos,
            "TYPE_ANSWER",
            sent4.en,
            "source",
            solution=sent4.es,
        )
        for alt in [sent4.es] + sent4.es_alt:
            conn.execute(
                "INSERT OR IGNORE INTO exercise_accepted_answers (exercise_id, text) VALUES (?, ?)",
                (ex_id, alt),
            )


def seed(conn: sqlite3.Connection) -> None:
    rng = random.Random(42)

    # Drop existing tables cleanly so reset works reliably
    tables = [
        r["name"]
        for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
        ).fetchall()
    ]
    conn.execute("PRAGMA foreign_keys = OFF")
    for t in tables:
        conn.execute(f"DROP TABLE IF EXISTS {t}")
    conn.execute("PRAGMA foreign_keys = ON")

    db.init_schema(conn)
    clock.set_day_offset(conn, 0)

    now = clock.now(conn)
    today = now.date()

    # 1. Courses: Spanish (id=1) and Korean (id=2), plus placeholder courses
    cur = conn.execute(
        """INSERT INTO courses (language_code, title, flag_src, speech_locale)
           VALUES (?, ?, ?, ?)""",
        (COURSE["language_code"], COURSE["title"], COURSE["flag_src"], COURSE["speech_locale"]),
    )
    course_id = cur.lastrowid

    kr_cur = conn.execute(
        """INSERT INTO courses (language_code, title, flag_src, speech_locale)
           VALUES (?, ?, ?, ?)""",
        (
            KOREAN_COURSE["language_code"],
            KOREAN_COURSE["title"],
            KOREAN_COURSE["flag_src"],
            KOREAN_COURSE["speech_locale"],
        ),
    )
    korean_course_id = kr_cur.lastrowid

    # Also add extra placeholder courses for language switcher UI
    extra_courses = [
        ("jp", "Japanese", "/jp.svg", "ja-JP"),
        ("fr", "French", "/fr.svg", "fr-FR"),
        ("it", "Italian", "/it.svg", "it-IT"),
        ("hr", "Croatian", "/hr.svg", "hr-HR"),
    ]
    for code, title, flag, locale in extra_courses:
        conn.execute(
            "INSERT INTO courses (language_code, title, flag_src, speech_locale) VALUES (?, ?, ?, ?)",
            (code, title, flag, locale),
        )

    # 2. Seed Units, skills, lessons, vocabulary, exercises for Spanish & Korean
    def _seed_course_units(cid: int, units_list: list) -> list[tuple[int, int]]:
        lesson_ids: list[tuple[int, int]] = []
        for u_pos, unit in enumerate(units_list, start=1):
            u_cur = conn.execute(
                """INSERT INTO units (course_id, position, section, title, description, color)
                   VALUES (?, ?, 1, ?, ?, ?)""",
                (cid, u_pos, unit["title"], unit["description"], unit["color"]),
            )
            unit_id = u_cur.lastrowid

            for s_pos, skill in enumerate(unit["skills"], start=1):
                s_cur = conn.execute(
                    """INSERT INTO skills (unit_id, position, title, icon)
                       VALUES (?, ?, ?, ?)""",
                    (unit_id, s_pos, skill["title"], skill["icon"]),
                )
                skill_id = s_cur.lastrowid

                for term, translation, img, aud in skill["vocab"]:
                    conn.execute(
                        """INSERT INTO vocabulary (skill_id, term, translation, image_src, audio_src)
                           VALUES (?, ?, ?, ?, ?)""",
                        (skill_id, term, translation, img, aud),
                    )

                for l_pos in range(1, LESSONS_PER_SKILL + 1):
                    l_cur = conn.execute(
                        "INSERT INTO lessons (skill_id, position, xp_reward) VALUES (?, ?, 10)",
                        (skill_id, l_pos),
                    )
                    lesson_id = l_cur.lastrowid
                    lesson_ids.append((lesson_id, skill_id))
                    _build_lesson_exercises(
                        conn, lesson_id, l_pos - 1, skill["vocab"], skill["sentences"], rng
                    )
        return lesson_ids

    all_lesson_ids = _seed_course_units(course_id, UNITS)
    _seed_course_units(korean_course_id, KOREAN_UNITS)

    # 3. Achievements & Quests
    for family, title, metric, color, tiers in ACHIEVEMENTS:
        for level, (threshold, desc) in enumerate(tiers, start=1):
            conn.execute(
                """INSERT INTO achievements (family, level, title, description, metric, threshold, color)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (family, level, title, desc, metric, threshold, color),
            )

    for code, title, metric, target, reward in QUESTS:
        conn.execute(
            """INSERT INTO quests (code, title, metric, target, gem_reward)
               VALUES (?, ?, ?, ?, ?)""",
            (code, title, metric, target, reward),
        )

    # 4. Default Learner (id = 1) with sample progress:
    #    - 5-day streak ending yesterday (or active today with 15 XP)
    #    - First skill ("Meet people", 2 lessons) completed + 1st lesson of "Greetings" completed
    created_at = clock.iso(now - timedelta(days=30))
    conn.execute(
        """INSERT INTO users
           (id, username, display_name, avatar_color, created_at, active_course_id,
            hearts, hearts_updated_at, gems, streak_count, streak_last_date,
            longest_streak, streak_freezes, daily_goal_xp)
           VALUES (1, ?, ?, ?, ?, ?, 5, ?, 520, 5, ?, 7, 1, 20)""",
        (
            LEARNER["username"],
            LEARNER["display_name"],
            LEARNER["avatar_color"],
            created_at,
            course_id,
            clock.iso(now),
            today.isoformat(),
        ),
    )
    conn.execute("INSERT INTO user_settings (user_id) VALUES (1)")

    # Mark first 3 lessons completed over the past few days
    for idx, (lesson_id, skill_id) in enumerate(all_lesson_ids[:3]):
        day_dt = now - timedelta(days=2 - idx)
        s_cur = conn.execute(
            """INSERT INTO lesson_sessions
               (user_id, lesson_id, skill_id, mode, status, started_at, completed_at, mistakes, xp_earned)
               VALUES (1, ?, ?, 'lesson', 'completed', ?, ?, 0, 15)""",
            (lesson_id, skill_id, clock.iso(day_dt - timedelta(minutes=3)), clock.iso(day_dt)),
        )
        sess_id = s_cur.lastrowid
        conn.execute(
            """INSERT INTO xp_events (user_id, session_id, amount, source, created_at)
               VALUES (1, ?, 15, 'lesson', ?)""",
            (sess_id, clock.iso(day_dt)),
        )

    # Add earlier streak days (3 and 4 days ago) so the 5-day streak calendar is lit up
    for days_ago, xp_amt in [(3, 25), (4, 20), (5, 30)]:
        day_dt = now - timedelta(days=days_ago)
        conn.execute(
            """INSERT INTO xp_events (user_id, session_id, amount, source, created_at)
               VALUES (1, NULL, ?, 'seed', ?)""",
            (xp_amt, clock.iso(day_dt)),
        )

    gamification.evaluate_achievements(conn, 1)

    # 5. Seed rival learners for the Weekly Leaderboard
    week_monday = clock.week_start(today)
    monday_dt = clock.parse(clock.day_bounds(week_monday)[0]) + timedelta(hours=10)
    rival_xps = [240, 195, 160, 130, 115, 95, 80, 65, 50, 40, 30, 20, 15, 10]
    for (uname, dname, color), xp_val in zip(RIVALS, rival_xps):
        r_cur = conn.execute(
            """INSERT INTO users
               (username, display_name, avatar_color, created_at, active_course_id,
                hearts, hearts_updated_at, gems, streak_count, streak_last_date,
                longest_streak, streak_freezes, daily_goal_xp)
               VALUES (?, ?, ?, ?, ?, 5, ?, 300, ?, ?, ?, 0, 20)""",
            (
                uname,
                dname,
                color,
                created_at,
                course_id,
                clock.iso(now),
                rng.randint(1, 25),
                today.isoformat(),
                rng.randint(5, 40),
            ),
        )
        rival_id = r_cur.lastrowid
        conn.execute("INSERT INTO user_settings (user_id) VALUES (?)", (rival_id,))
        conn.execute(
            """INSERT INTO xp_events (user_id, session_id, amount, source, created_at)
               VALUES (?, NULL, ?, 'seed', ?)""",
            (rival_id, xp_val, clock.iso(monday_dt)),
        )


if __name__ == "__main__":
    connection = db.connect()
    try:
        seed(connection)
        connection.commit()
        print("Database seeded successfully.")
    finally:
        connection.close()

