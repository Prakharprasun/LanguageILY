"""Public learner profile: stats, achievements and recent XP."""

import sqlite3

from app.services import gamification, users as user_service


def profile(conn: sqlite3.Connection, user_id: int) -> dict:
    user = user_service.sync_user(conn, user_id)
    board = gamification.leaderboard(conn, user_id)
    rank = next(e["rank"] for e in board["entries"] if e["user_id"] == user_id)
    values = gamification.metrics(conn, user_id)
    course = conn.execute(
        "SELECT title, flag_src FROM courses WHERE id = ?", (user["active_course_id"],)
    ).fetchone()
    return {
        "id": user["id"],
        "display_name": user["display_name"],
        "username": user["username"],
        "avatar_color": user["avatar_color"],
        "created_at": user["created_at"],
        "courses": [{"title": course["title"], "flag_src": course["flag_src"]}] if course else [],
        "stats": {
            "streak": user["streak_count"],
            "longest_streak": user["longest_streak"],
            "total_xp": values["total_xp"],
            "league": board["league"],
            "league_rank": rank,
            "lessons_completed": values["lessons"],
            "perfect_lessons": values["perfect_lessons"],
            "skills_completed": values["skills"],
            "words_learned": values["words"],
        },
        "achievements": gamification.achievements_overview(conn, user_id),
        "weekly_xp": gamification.weekly_xp_chart(conn, user_id),
    }

