"""Streaks, achievements, daily quests and the leaderboard."""

import sqlite3
from datetime import date, timedelta

from app import clock
from app.config import LEAGUE_DEMOTION_SPOTS, LEAGUE_NAME, LEAGUE_PROMOTION_SPOTS
from app.services import users as user_service

# ---------------------------------------------------------------- streaks


def register_activity(conn: sqlite3.Connection, user_id: int, today: date) -> dict:
    """Called when a learner finishes a lesson or practice. Extends the streak
    at most once per day."""
    user = user_service.get_user_row(conn, user_id)
    last = date.fromisoformat(user["streak_last_date"]) if user["streak_last_date"] else None
    streak = user["streak_count"]

    if last == today:
        return {"streak": streak, "extended": False}
    if last == today - timedelta(days=1) and streak > 0:
        streak += 1
    else:
        streak = 1

    conn.execute(
        """UPDATE users SET streak_count = ?, streak_last_date = ?,
                            longest_streak = MAX(longest_streak, ?)
           WHERE id = ?""",
        (streak, today.isoformat(), streak, user_id),
    )
    return {"streak": streak, "extended": True}


# ----------------------------------------------------------- achievements


def metrics(conn: sqlite3.Connection, user_id: int) -> dict[str, int]:
    user = user_service.get_user_row(conn, user_id)
    lesson_stats = conn.execute(
        """SELECT COUNT(DISTINCT lesson_id) AS lessons,
                  COUNT(DISTINCT CASE WHEN mistakes = 0 THEN id END) AS perfect
           FROM lesson_sessions
           WHERE user_id = ? AND mode = 'lesson' AND status = 'completed'""",
        (user_id,),
    ).fetchone()
    # skills where every lesson has a completed session
    skills = conn.execute(
        """SELECT COUNT(*) FROM (
               SELECT l.skill_id FROM lessons l
               LEFT JOIN (SELECT DISTINCT lesson_id FROM lesson_sessions
                          WHERE user_id = ? AND mode = 'lesson' AND status = 'completed') d
                      ON d.lesson_id = l.id
               GROUP BY l.skill_id
               HAVING COUNT(*) = COUNT(d.lesson_id))""",
        (user_id,),
    ).fetchone()[0]
    # words of skills the learner has started (at least one lesson completed)
    words = conn.execute(
        """SELECT COUNT(*) FROM vocabulary WHERE skill_id IN (
               SELECT DISTINCT l.skill_id FROM lesson_sessions ls
               JOIN lessons l ON l.id = ls.lesson_id
               WHERE ls.user_id = ? AND ls.mode = 'lesson' AND ls.status = 'completed')""",
        (user_id,),
    ).fetchone()[0]
    return {
        "streak": max(user["streak_count"], user["longest_streak"]),
        "total_xp": user_service.total_xp(conn, user_id),
        "lessons": lesson_stats["lessons"],
        "perfect_lessons": lesson_stats["perfect"],
        "skills": skills,
        "words": words,
    }


def evaluate_achievements(conn: sqlite3.Connection, user_id: int) -> list[dict]:
    """Unlocks every achievement whose threshold is met. Returns the new ones."""
    values = metrics(conn, user_id)
    pending = conn.execute(
        """SELECT a.* FROM achievements a
           WHERE NOT EXISTS (SELECT 1 FROM user_achievements ua
                             WHERE ua.user_id = ? AND ua.achievement_id = a.id)
           ORDER BY a.family, a.level""",
        (user_id,),
    ).fetchall()
    now = clock.iso(clock.now(conn))
    unlocked = []
    for a in pending:
        if values[a["metric"]] >= a["threshold"]:
            conn.execute(
                "INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)",
                (user_id, a["id"], now),
            )
            unlocked.append(
                {"family": a["family"], "title": a["title"], "level": a["level"],
                 "description": a["description"], "color": a["color"]}
            )
    return unlocked


def achievements_overview(conn: sqlite3.Connection, user_id: int) -> list[dict]:
    """One card per achievement family: current level and progress to the next."""
    values = metrics(conn, user_id)
    rows = conn.execute(
        """SELECT a.*, ua.unlocked_at FROM achievements a
           LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
           ORDER BY a.family, a.level""",
        (user_id,),
    ).fetchall()
    families: dict[str, list[sqlite3.Row]] = {}
    for r in rows:
        families.setdefault(r["family"], []).append(r)

    cards = []
    for family, levels in families.items():
        unlocked = [lv for lv in levels if lv["unlocked_at"]]
        next_level = next((lv for lv in levels if not lv["unlocked_at"]), None)
        shown = next_level or levels[-1]
        value = values[shown["metric"]]
        cards.append(
            {
                "family": family,
                "title": shown["title"],
                "description": shown["description"],
                "color": shown["color"],
                "level": len(unlocked),
                "max_level": len(levels),
                "progress": min(value, shown["threshold"]),
                "target": shown["threshold"],
                "completed": next_level is None,
            }
        )
    return cards


# ----------------------------------------------------------------- quests


def _quest_values(conn: sqlite3.Connection, user_id: int, today: date) -> dict[str, int]:
    start, end = clock.day_bounds(today)
    stats = conn.execute(
        """SELECT COUNT(*) AS lessons,
                  COALESCE(SUM(CASE WHEN mistakes = 0 THEN 1 ELSE 0 END), 0) AS perfect
           FROM lesson_sessions
           WHERE user_id = ? AND mode = 'lesson' AND status = 'completed'
             AND completed_at >= ? AND completed_at < ?""",
        (user_id, start, end),
    ).fetchone()
    return {
        "xp_today": user_service.xp_on_day(conn, user_id, today),
        "lessons_today": stats["lessons"],
        "perfect_today": stats["perfect"],
    }


def daily_quests(conn: sqlite3.Connection, user_id: int) -> list[dict]:
    today = clock.today(conn)
    values = _quest_values(conn, user_id, today)
    rows = conn.execute(
        """SELECT q.*, r.claimed_at FROM quests q
           LEFT JOIN user_quest_rewards r
                  ON r.quest_id = q.id AND r.user_id = ? AND r.quest_date = ?
           ORDER BY q.id""",
        (user_id, today.isoformat()),
    ).fetchall()
    return [
        {
            "code": q["code"],
            "title": q["title"],
            "metric": q["metric"],
            "progress": min(values[q["metric"]], q["target"]),
            "target": q["target"],
            "gem_reward": q["gem_reward"],
            "completed": values[q["metric"]] >= q["target"],
            "rewarded": q["claimed_at"] is not None,
        }
        for q in rows
    ]


def reward_completed_quests(conn: sqlite3.Connection, user_id: int) -> list[dict]:
    """Grants gems for quests completed today that were not rewarded yet."""
    today = clock.today(conn)
    now = clock.iso(clock.now(conn))
    rewarded = []
    for quest in daily_quests(conn, user_id):
        if quest["completed"] and not quest["rewarded"]:
            quest_id = conn.execute(
                "SELECT id FROM quests WHERE code = ?", (quest["code"],)
            ).fetchone()["id"]
            conn.execute(
                "INSERT INTO user_quest_rewards (user_id, quest_id, quest_date, claimed_at) "
                "VALUES (?, ?, ?, ?)",
                (user_id, quest_id, today.isoformat(), now),
            )
            conn.execute(
                "UPDATE users SET gems = gems + ? WHERE id = ?", (quest["gem_reward"], user_id)
            )
            rewarded.append({"title": quest["title"], "gem_reward": quest["gem_reward"]})
    return rewarded


# ------------------------------------------------------------ leaderboard


def leaderboard(conn: sqlite3.Connection, user_id: int) -> dict:
    """Weekly league: everyone ranked by XP earned since Monday."""
    today = clock.today(conn)
    start = clock.week_start(today)
    rows = conn.execute(
        """SELECT u.id, u.display_name, u.username, u.avatar_color,
                  COALESCE(SUM(x.amount), 0) AS xp
           FROM users u
           LEFT JOIN xp_events x ON x.user_id = u.id AND x.created_at >= ?
           GROUP BY u.id
           ORDER BY xp DESC, u.display_name ASC""",
        (clock.day_bounds(start)[0],),
    ).fetchall()
    total = len(rows)
    entries = []
    for i, r in enumerate(rows, start=1):
        zone = (
            "promotion" if i <= LEAGUE_PROMOTION_SPOTS
            else "demotion" if i > total - LEAGUE_DEMOTION_SPOTS
            else "safe"
        )
        entries.append(
            {
                "rank": i,
                "user_id": r["id"],
                "display_name": r["display_name"],
                "username": r["username"],
                "avatar_color": r["avatar_color"],
                "xp": r["xp"],
                "zone": zone,
                "is_current_user": r["id"] == user_id,
            }
        )
    return {
        "league": LEAGUE_NAME,
        "week_start": start.isoformat(),
        "days_left": 7 - today.weekday(),
        "promotion_spots": LEAGUE_PROMOTION_SPOTS,
        "demotion_spots": LEAGUE_DEMOTION_SPOTS,
        "entries": entries,
    }


def weekly_xp_chart(conn: sqlite3.Connection, user_id: int) -> list[dict]:
    today = clock.today(conn)
    days = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        days.append({"date": day.isoformat(), "xp": user_service.xp_on_day(conn, user_id, day)})
    return days

