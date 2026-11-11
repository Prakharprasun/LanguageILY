"""Learning path: units -> skills -> lessons, and each node's state for a learner.

Progress is strictly linear (as on Duolingo): every skill before the first
unfinished one is completed, that one is active, everything after it is locked.
"""

import sqlite3

from app.errors import NotFound


def completed_lesson_ids(conn: sqlite3.Connection, user_id: int) -> set[int]:
    rows = conn.execute(
        """SELECT DISTINCT lesson_id FROM lesson_sessions
           WHERE user_id = ? AND mode = 'lesson' AND status = 'completed'""",
        (user_id,),
    ).fetchall()
    return {r["lesson_id"] for r in rows}


def build_path(conn: sqlite3.Connection, user_id: int, course_id: int) -> dict:
    course = conn.execute("SELECT * FROM courses WHERE id = ?", (course_id,)).fetchone()
    if course is None:
        raise NotFound("Course")

    units = conn.execute(
        "SELECT * FROM units WHERE course_id = ? ORDER BY position", (course_id,)
    ).fetchall()
    skills = conn.execute(
        """SELECT s.* FROM skills s JOIN units u ON u.id = s.unit_id
           WHERE u.course_id = ? ORDER BY u.position, s.position""",
        (course_id,),
    ).fetchall()
    lessons = conn.execute(
        """SELECT l.* FROM lessons l
           JOIN skills s ON s.id = l.skill_id
           JOIN units u ON u.id = s.unit_id
           WHERE u.course_id = ? ORDER BY u.position, s.position, l.position""",
        (course_id,),
    ).fetchall()
    done = completed_lesson_ids(conn, user_id)

    lessons_by_skill: dict[int, list[sqlite3.Row]] = {}
    for lesson in lessons:
        lessons_by_skill.setdefault(lesson["skill_id"], []).append(lesson)
    skills_by_unit: dict[int, list[sqlite3.Row]] = {}
    for skill in skills:
        skills_by_unit.setdefault(skill["unit_id"], []).append(skill)

    found_active = False
    result_units = []
    for unit in units:
        unit_skills = []
        for skill in skills_by_unit.get(unit["id"], []):
            skill_lessons = lessons_by_skill.get(skill["id"], [])
            completed = sum(1 for lesson in skill_lessons if lesson["id"] in done)
            if skill_lessons and completed == len(skill_lessons):
                state = "completed"
            elif not found_active:
                state, found_active = "active", True
            else:
                state = "locked"
            next_lesson = next((l for l in skill_lessons if l["id"] not in done), None)
            unit_skills.append(
                {
                    "id": skill["id"],
                    "title": skill["title"],
                    "icon": skill["icon"],
                    "position": skill["position"],
                    "state": state,
                    "lessons_total": len(skill_lessons),
                    "lessons_completed": completed,
                    "next_lesson_id": next_lesson["id"] if next_lesson else None,
                    "next_lesson_xp": next_lesson["xp_reward"] if next_lesson else None,
                    "lesson_ids": [l["id"] for l in skill_lessons],
                }
            )
        states = {s["state"] for s in unit_skills}
        unit_state = (
            "completed" if states == {"completed"} else "active" if "active" in states else "locked"
        )
        result_units.append(
            {
                "id": unit["id"],
                "position": unit["position"],
                "section": unit["section"],
                "title": unit["title"],
                "description": unit["description"],
                "color": unit["color"],
                "state": unit_state,
                "skills": unit_skills,
            }
        )

    active_skill = next(
        (s for u in result_units for s in u["skills"] if s["state"] == "active"), None
    )
    return {
        "course": {
            "id": course["id"],
            "title": course["title"],
            "language_code": course["language_code"],
            "flag_src": course["flag_src"],
            "speech_locale": course["speech_locale"],
        },
        "units": result_units,
        "active_skill_id": active_skill["id"] if active_skill else None,
        "active_lesson_id": active_skill["next_lesson_id"] if active_skill else None,
    }


def lesson_access(conn: sqlite3.Connection, user_id: int, lesson_id: int) -> str:
    """'current' (next lesson to do), 'completed' (can be replayed) or 'locked'."""
    lesson = conn.execute(
        """SELECT l.id, u.course_id FROM lessons l
           JOIN skills s ON s.id = l.skill_id JOIN units u ON u.id = s.unit_id
           WHERE l.id = ?""",
        (lesson_id,),
    ).fetchone()
    if lesson is None:
        raise NotFound("Lesson")
    if lesson_id in completed_lesson_ids(conn, user_id):
        return "completed"
    path = build_path(conn, user_id, lesson["course_id"])
    return "current" if path["active_lesson_id"] == lesson_id else "locked"


def guidebook(conn: sqlite3.Connection, unit_id: int) -> dict:
    unit = conn.execute("SELECT * FROM units WHERE id = ?", (unit_id,)).fetchone()
    if unit is None:
        raise NotFound("Unit")
    rows = conn.execute(
        """SELECT s.title AS skill, v.term, v.translation, v.audio_src
           FROM vocabulary v JOIN skills s ON s.id = v.skill_id
           WHERE s.unit_id = ? ORDER BY s.position, v.id""",
        (unit_id,),
    ).fetchall()
    sections: dict[str, list[dict]] = {}
    for r in rows:
        sections.setdefault(r["skill"], []).append(
            {"term": r["term"], "translation": r["translation"], "audio_src": r["audio_src"]}
        )
    return {
        "unit": {
            "id": unit["id"],
            "title": unit["title"],
            "description": unit["description"],
            "color": unit["color"],
            "position": unit["position"],
        },
        "sections": [{"skill": k, "phrases": v} for k, v in sections.items()],
    }

