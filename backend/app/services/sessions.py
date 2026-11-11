"""The lesson loop: start a session, grade answers (hearts), complete it (XP, streak,
quests, achievements)."""

import json
import random
import sqlite3

from app import clock
from app.config import MAX_HEARTS, PERFECT_LESSON_BONUS_XP, PRACTICE_SESSION_SIZE, PRACTICE_XP
from app.errors import AppError, Conflict, NotFound
from app.services import gamification, path, users as user_service
from app.services.grading import GradeResult, grade_text, normalize

_ARTICLES = {"el", "la", "los", "las", "un", "una", "the", "a", "an"}


# ------------------------------------------------------------ word hints


def _glossary(conn: sqlite3.Connection, prompt_lang: str) -> dict[str, str]:
    """normalized phrase -> translation, in the direction of the prompt language."""
    rows = conn.execute("SELECT term, translation FROM vocabulary").fetchall()
    glossary: dict[str, str] = {}
    for r in rows:
        src, dst = (r["term"], r["translation"]) if prompt_lang == "target" else (
            r["translation"], r["term"])
        key = normalize(src)
        glossary.setdefault(key, dst)
        words = key.split()
        if len(words) > 1 and words[0] in _ARTICLES:  # "la manzana" also hints "manzana"
            dst_words = dst.split()
            bare = " ".join(dst_words[1:]) if dst_words[0].lower() in _ARTICLES else dst
            glossary.setdefault(" ".join(words[1:]), bare)
    return glossary


def build_hints(glossary: dict[str, str], prompt: str) -> list[dict]:
    """Splits the prompt into segments; segments found in the glossary carry a hint.
    Greedy longest match (up to 3 words) so 'buenos días' wins over 'buenos'."""
    tokens = prompt.split()
    segments, i = [], 0
    while i < len(tokens):
        for size in (3, 2, 1):
            chunk = tokens[i:i + size]
            if len(chunk) < size:
                continue
            key = normalize(" ".join(chunk))
            if key and key in glossary:
                segments.append({"text": " ".join(chunk), "hint": glossary[key]})
                i += size
                break
        else:
            segments.append({"text": tokens[i], "hint": None})
            i += 1
    return segments


# ---------------------------------------------------------- serialization


def _options(conn: sqlite3.Connection, exercise_id: int) -> list[sqlite3.Row]:
    return conn.execute(
        "SELECT * FROM exercise_options WHERE exercise_id = ? ORDER BY position", (exercise_id,)
    ).fetchall()


def serialize_exercise(conn: sqlite3.Connection, ex: sqlite3.Row, glossaries: dict) -> dict:
    """Client view of an exercise. Correct answers are NOT included (except for
    match pairs, which are matched interactively on the client)."""
    options = _options(conn, ex["id"])
    data = {
        "id": ex["id"],
        "type": ex["type"],
        "prompt": ex["prompt"],
        "prompt_lang": ex["prompt_lang"],
        "translation": ex["translation"],
        "hints": build_hints(glossaries[ex["prompt_lang"]], ex["prompt"])
        if ex["type"] in ("TRANSLATE", "TYPE_ANSWER", "MULTIPLE_CHOICE") else [],
        "options": [],
        "tiles": [],
        "pairs": None,
    }
    if ex["type"] in ("MULTIPLE_CHOICE", "FILL_BLANK"):
        data["options"] = [
            {"id": o["id"], "text": o["text"], "image_src": o["image_src"], "audio_src": o["audio_src"]}
            for o in options
        ]
    elif ex["type"] == "TRANSLATE":
        data["tiles"] = [{"id": o["id"], "text": o["text"]} for o in options]
    elif ex["type"] == "MATCH_PAIRS":
        left = [{"id": o["id"], "text": o["text"], "audio_src": o["audio_src"]} for o in options]
        right = [{"id": o["id"], "text": o["match_text"]} for o in options]
        random.shuffle(left)
        random.shuffle(right)
        data["pairs"] = {"left": left, "right": right}
    return data


def _session_payload(conn: sqlite3.Connection, user_id: int, session_id: int) -> dict:
    session = conn.execute("SELECT * FROM lesson_sessions WHERE id = ?", (session_id,)).fetchone()
    exercises = conn.execute(
        """SELECT e.* FROM session_exercises se JOIN exercises e ON e.id = se.exercise_id
           WHERE se.session_id = ? ORDER BY se.position""",
        (session_id,),
    ).fetchall()
    glossaries = {"target": _glossary(conn, "target"), "source": _glossary(conn, "source")}
    user = user_service.get_user_row(conn, user_id)
    context = None
    course = None
    if session["skill_id"]:
        context = conn.execute(
            """SELECT s.title AS skill_title, u.color AS unit_color,
                      u.position AS unit_position, u.course_id AS course_id
               FROM skills s JOIN units u ON u.id = s.unit_id WHERE s.id = ?""",
            (session["skill_id"],),
        ).fetchone()
        if context:
            course = conn.execute(
                "SELECT * FROM courses WHERE id = ?", (context["course_id"],)
            ).fetchone()
    if course is None:
        course = conn.execute(
            "SELECT * FROM courses WHERE id = ?", (user["active_course_id"],)
        ).fetchone()
    lesson_position = None
    if session["lesson_id"]:
        lesson_position = conn.execute(
            "SELECT position FROM lessons WHERE id = ?", (session["lesson_id"],)
        ).fetchone()["position"]

    return {
        "session": {
            "id": session["id"],
            "mode": session["mode"],
            "lesson_id": session["lesson_id"],
            "lesson_position": lesson_position,
            "skill_id": session["skill_id"],
            "skill_title": context["skill_title"] if context else "Practice",
            "unit_color": context["unit_color"] if context else "green",
            "course_title": course["title"] if course else "Spanish",
        },
        "exercises": [serialize_exercise(conn, ex, glossaries) for ex in exercises],
        "hearts": user["hearts"],
        "max_hearts": MAX_HEARTS,
        "speech_locale": course["speech_locale"] if course else "es-ES",
    }


# -------------------------------------------------------------- start


def _create_session(conn, user_id, mode, lesson_id, skill_id, exercise_ids) -> int:
    now = clock.iso(clock.now(conn))
    conn.execute(
        "UPDATE lesson_sessions SET status = 'abandoned' WHERE user_id = ? AND status = 'active'",
        (user_id,),
    )
    cur = conn.execute(
        """INSERT INTO lesson_sessions (user_id, lesson_id, skill_id, mode, started_at)
           VALUES (?, ?, ?, ?, ?)""",
        (user_id, lesson_id, skill_id, mode, now),
    )
    session_id = cur.lastrowid
    conn.executemany(
        "INSERT INTO session_exercises (session_id, exercise_id, position) VALUES (?, ?, ?)",
        [(session_id, ex_id, i) for i, ex_id in enumerate(exercise_ids, start=1)],
    )
    return session_id


def start_lesson(conn: sqlite3.Connection, user_id: int, lesson_id: int) -> dict:
    user = user_service.sync_user(conn, user_id)
    access = path.lesson_access(conn, user_id, lesson_id)
    if access == "locked":
        raise AppError("lesson_locked", "Complete the previous lessons to unlock this one.", 403)
    if user["hearts"] <= 0:
        raise Conflict("out_of_hearts", "You ran out of hearts! Practice or refill to continue.")

    lesson = conn.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,)).fetchone()
    exercise_ids = [
        r["id"] for r in conn.execute(
            "SELECT id FROM exercises WHERE lesson_id = ? ORDER BY position", (lesson_id,)
        )
    ]
    session_id = _create_session(conn, user_id, "lesson", lesson_id, lesson["skill_id"], exercise_ids)
    return _session_payload(conn, user_id, session_id)


def start_practice(conn: sqlite3.Connection, user_id: int, skill_id: int | None = None) -> dict:
    """Practice mixes exercises from completed lessons. It never costs hearts
    and earns one heart back, so it is the free way to refill."""
    user_service.sync_user(conn, user_id)
    done = path.completed_lesson_ids(conn, user_id)
    if skill_id is not None:
        if conn.execute("SELECT 1 FROM skills WHERE id = ?", (skill_id,)).fetchone() is None:
            raise NotFound("Skill")
        skill_lessons = {
            r["id"] for r in conn.execute("SELECT id FROM lessons WHERE skill_id = ?", (skill_id,))
        }
        done &= skill_lessons
    if not done:
        raise AppError("nothing_to_practice", "Complete a lesson first to unlock practice.")

    placeholders = ",".join("?" * len(done))
    candidates = [
        r["id"] for r in conn.execute(
            f"SELECT id FROM exercises WHERE lesson_id IN ({placeholders})", tuple(done)
        )
    ]
    chosen = random.sample(candidates, min(PRACTICE_SESSION_SIZE, len(candidates)))
    session_id = _create_session(conn, user_id, "practice", None, skill_id, chosen)
    return _session_payload(conn, user_id, session_id)


# ------------------------------------------------------------- answers


def _get_active_session(conn, user_id, session_id) -> sqlite3.Row:
    session = conn.execute(
        "SELECT * FROM lesson_sessions WHERE id = ? AND user_id = ?", (session_id, user_id)
    ).fetchone()
    if session is None:
        raise NotFound("Session")
    if session["status"] != "active":
        raise Conflict("session_not_active", f"This session is {session['status']}.")
    return session


def grade(conn: sqlite3.Connection, ex: sqlite3.Row, answer: str) -> tuple[GradeResult, str]:
    """Returns the grading result and the solution to show the learner."""
    options = _options(conn, ex["id"])

    if ex["type"] in ("MULTIPLE_CHOICE", "FILL_BLANK"):
        correct_option = next(o for o in options if o["is_correct"])
        solution = ex["solution"] or correct_option["text"]
        try:
            chosen = int(answer)
        except ValueError:
            return GradeResult(False), solution
        return GradeResult(chosen == correct_option["id"]), solution

    if ex["type"] == "MATCH_PAIRS":
        try:
            pairs = json.loads(answer)
            matched = {int(left) for left, right in pairs if int(left) == int(right)}
        except (ValueError, TypeError):
            return GradeResult(False), ""
        return GradeResult(matched == {o["id"] for o in options}), ""

    accepted = [ex["solution"]] + [
        r["text"] for r in conn.execute(
            "SELECT text FROM exercise_accepted_answers WHERE exercise_id = ?", (ex["id"],)
        )
    ]
    return grade_text(answer, accepted), ex["solution"]


def submit_answer(
    conn: sqlite3.Connection, user_id: int, session_id: int, exercise_id: int, answer: str
) -> dict:
    user_service.sync_user(conn, user_id)
    session = _get_active_session(conn, user_id, session_id)
    ex = conn.execute(
        """SELECT e.* FROM exercises e JOIN session_exercises se ON se.exercise_id = e.id
           WHERE se.session_id = ? AND e.id = ?""",
        (session_id, exercise_id),
    ).fetchone()
    if ex is None:
        raise NotFound("Exercise in this session")

    result, solution = grade(conn, ex, answer)
    conn.execute(
        """INSERT INTO session_answers (session_id, exercise_id, answer, is_correct, answered_at)
           VALUES (?, ?, ?, ?, ?)""",
        (session_id, exercise_id, answer, int(result.correct), clock.iso(clock.now(conn))),
    )

    status = "active"
    if not result.correct:
        conn.execute(
            "UPDATE lesson_sessions SET mistakes = mistakes + 1 WHERE id = ?", (session_id,)
        )
        if session["mode"] == "lesson":
            hearts = user_service.get_user_row(conn, user_id)["hearts"]
            user_service.set_hearts(conn, user_id, hearts - 1)
            if hearts - 1 <= 0:
                status = "failed"
                conn.execute(
                    "UPDATE lesson_sessions SET status = 'failed', completed_at = ? WHERE id = ?",
                    (clock.iso(clock.now(conn)), session_id),
                )

    return {
        "correct": result.correct,
        "note": result.note,
        "solution": solution,
        "hearts": user_service.get_user_row(conn, user_id)["hearts"],
        "session_status": status,
    }


# ------------------------------------------------------------ complete


def complete_session(conn: sqlite3.Connection, user_id: int, session_id: int) -> dict:
    session = _get_active_session(conn, user_id, session_id)
    unanswered = conn.execute(
        """SELECT COUNT(*) FROM session_exercises se
           WHERE se.session_id = ? AND NOT EXISTS (
               SELECT 1 FROM session_answers sa
               WHERE sa.session_id = se.session_id AND sa.exercise_id = se.exercise_id
                 AND sa.is_correct = 1)""",
        (session_id,),
    ).fetchone()[0]
    if unanswered:
        raise AppError("session_incomplete", f"{unanswered} exercise(s) still need a correct answer.")

    now = clock.now(conn)
    today = now.date()
    xp_before_today = user_service.xp_on_day(conn, user_id, today)
    user = user_service.get_user_row(conn, user_id)

    skill_was_completed = False
    if session["mode"] == "lesson":
        skill_was_completed = _skill_completed(conn, user_id, session["skill_id"])
        lesson = conn.execute(
            "SELECT * FROM lessons WHERE id = ?", (session["lesson_id"],)
        ).fetchone()
        base_xp = lesson["xp_reward"]
        bonus_xp = PERFECT_LESSON_BONUS_XP if session["mistakes"] == 0 else 0
    else:
        base_xp, bonus_xp = PRACTICE_XP, 0
        user_service.set_hearts(conn, user_id, user["hearts"] + 1)
    xp = base_xp + bonus_xp

    conn.execute(
        "UPDATE lesson_sessions SET status = 'completed', completed_at = ?, xp_earned = ? WHERE id = ?",
        (clock.iso(now), xp, session_id),
    )
    conn.execute(
        "INSERT INTO xp_events (user_id, session_id, amount, source, created_at) VALUES (?, ?, ?, ?, ?)",
        (user_id, session_id, xp, session["mode"], clock.iso(now)),
    )

    streak = gamification.register_activity(conn, user_id, today)
    quests = gamification.reward_completed_quests(conn, user_id)
    achievements = gamification.evaluate_achievements(conn, user_id)

    answers = conn.execute(
        "SELECT COUNT(*) FROM session_answers WHERE session_id = ?", (session_id,)
    ).fetchone()[0]
    exercises = conn.execute(
        "SELECT COUNT(*) FROM session_exercises WHERE session_id = ?", (session_id,)
    ).fetchone()[0]
    duration = int((now - clock.parse(session["started_at"])).total_seconds())

    summary = user_service.user_summary(conn, user_id)
    return {
        "xp_earned": xp,
        "base_xp": base_xp,
        "bonus_xp": bonus_xp,
        "mistakes": session["mistakes"],
        "accuracy": round(100 * exercises / answers) if answers else 100,
        "duration_seconds": duration,
        "streak": streak["streak"],
        "streak_extended": streak["extended"],
        "hearts": summary["hearts"],
        "today_xp": summary["today_xp"],
        "daily_goal_xp": summary["daily_goal_xp"],
        "daily_goal_reached_now": xp_before_today < summary["daily_goal_xp"] <= summary["today_xp"],
        "week_activity": summary["week_activity"],
        "skill_completed": session["mode"] == "lesson" and not skill_was_completed
        and _skill_completed(conn, user_id, session["skill_id"]),
        "achievements_unlocked": achievements,
        "quests_completed": quests,
        "gems": summary["gems"],
    }


def _skill_completed(conn: sqlite3.Connection, user_id: int, skill_id: int | None) -> bool:
    if skill_id is None:
        return False
    lesson_ids = {r["id"] for r in conn.execute("SELECT id FROM lessons WHERE skill_id = ?", (skill_id,))}
    return bool(lesson_ids) and lesson_ids <= path.completed_lesson_ids(conn, user_id)
