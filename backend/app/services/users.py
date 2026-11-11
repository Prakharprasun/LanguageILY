"""Learner state: lazy heart regeneration, streak decay and the summary
shown in the top bar."""

import sqlite3
from datetime import date, datetime, timedelta

from app import clock
from app.config import DAILY_GOALS, HEART_REGEN_MINUTES, MAX_HEARTS
from app.errors import NotFound

_REGEN = timedelta(minutes=HEART_REGEN_MINUTES)


def get_user_row(conn: sqlite3.Connection, user_id: int) -> sqlite3.Row:
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise NotFound("User")
    return row


def regenerate_hearts(hearts: int, updated_at: datetime, now: datetime) -> tuple[int, datetime]:
    """Returns the new heart count and the timestamp regeneration counts from."""
    if hearts >= MAX_HEARTS:
        return MAX_HEARTS, now
    gained = int((now - updated_at) / _REGEN)
    if gained <= 0:
        return hearts, updated_at
    hearts = min(MAX_HEARTS, hearts + gained)
    return hearts, (now if hearts == MAX_HEARTS else updated_at + gained * _REGEN)


def decay_streak(
    streak: int, last_date: date | None, freezes: int, today: date
) -> tuple[int, date | None, int]:
    """Breaks the streak when whole days were missed, unless streak freezes cover them.

    Returns (streak, last_date, freezes). A freeze "fills" a missed day, so after
    using freezes the streak is still alive and can be extended today.
    """
    if streak == 0 or last_date is None:
        return streak, last_date, freezes
    missed = (today - last_date).days - 1
    if missed <= 0:
        return streak, last_date, freezes
    if freezes >= missed:
        return streak, today - timedelta(days=1), freezes - missed
    return 0, last_date, freezes


def sync_user(conn: sqlite3.Connection, user_id: int) -> sqlite3.Row:
    """Brings time-dependent state up to date. Called before any read or write of a user."""
    user = get_user_row(conn, user_id)
    now = clock.now(conn)

    hearts, hearts_updated_at = regenerate_hearts(
        user["hearts"], clock.parse(user["hearts_updated_at"]), now
    )
    last_date = date.fromisoformat(user["streak_last_date"]) if user["streak_last_date"] else None
    streak, last_date, freezes = decay_streak(
        user["streak_count"], last_date, user["streak_freezes"], now.date()
    )

    conn.execute(
        """UPDATE users SET hearts = ?, hearts_updated_at = ?, streak_count = ?,
                            streak_last_date = ?, streak_freezes = ?
           WHERE id = ?""",
        (
            hearts,
            clock.iso(hearts_updated_at),
            streak,
            last_date.isoformat() if last_date else None,
            freezes,
            user_id,
        ),
    )
    return get_user_row(conn, user_id)


def set_hearts(conn: sqlite3.Connection, user_id: int, hearts: int) -> None:
    """Changes hearts and restarts the regeneration timer when hearts go from full to not full."""
    user = get_user_row(conn, user_id)
    hearts = max(0, min(MAX_HEARTS, hearts))
    updated_at = user["hearts_updated_at"]
    if user["hearts"] >= MAX_HEARTS and hearts < MAX_HEARTS:
        updated_at = clock.iso(clock.now(conn))
    conn.execute(
        "UPDATE users SET hearts = ?, hearts_updated_at = ? WHERE id = ?",
        (hearts, updated_at, user_id),
    )


def total_xp(conn: sqlite3.Connection, user_id: int) -> int:
    row = conn.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM xp_events WHERE user_id = ?", (user_id,)
    ).fetchone()
    return row[0]


def xp_on_day(conn: sqlite3.Connection, user_id: int, day: date) -> int:
    start, end = clock.day_bounds(day)
    row = conn.execute(
        """SELECT COALESCE(SUM(amount), 0) FROM xp_events
           WHERE user_id = ? AND created_at >= ? AND created_at < ?""",
        (user_id, start, end),
    ).fetchone()
    return row[0]


def active_days(conn: sqlite3.Connection, user_id: int, since: date) -> set[str]:
    rows = conn.execute(
        """SELECT DISTINCT substr(created_at, 1, 10) AS day FROM xp_events
           WHERE user_id = ? AND created_at >= ?""",
        (user_id, clock.day_bounds(since)[0]),
    ).fetchall()
    return {r["day"] for r in rows}


def get_settings(conn: sqlite3.Connection, user_id: int) -> dict:
    row = conn.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,)).fetchone()
    if row is None:
        conn.execute("INSERT INTO user_settings (user_id) VALUES (?)", (user_id,))
        row = conn.execute("SELECT * FROM user_settings WHERE user_id = ?", (user_id,)).fetchone()
    return {k: bool(row[k]) for k in row.keys() if k != "user_id"}


def user_summary(conn: sqlite3.Connection, user_id: int) -> dict:
    """Everything the top bar / sidebar widgets need about the current learner."""
    user = sync_user(conn, user_id)
    now = clock.now(conn)
    today = now.date()

    next_heart_at = None
    if user["hearts"] < MAX_HEARTS:
        next_heart_at = clock.iso(clock.parse(user["hearts_updated_at"]) + _REGEN)

    course = None
    if user["active_course_id"]:
        c = conn.execute(
            "SELECT * FROM courses WHERE id = ?", (user["active_course_id"],)
        ).fetchone()
        course = {
            "id": c["id"],
            "title": c["title"],
            "language_code": c["language_code"],
            "flag_src": c["flag_src"],
            "speech_locale": c["speech_locale"],
        }

    week_start = today - timedelta(days=6)
    days = active_days(conn, user_id, week_start)

    return {
        "id": user["id"],
        "username": user["username"],
        "display_name": user["display_name"],
        "avatar_color": user["avatar_color"],
        "created_at": user["created_at"],
        "course": course,
        "hearts": user["hearts"],
        "max_hearts": MAX_HEARTS,
        "next_heart_at": next_heart_at,
        "gems": user["gems"],
        "streak": user["streak_count"],
        "longest_streak": user["longest_streak"],
        "streak_freezes": user["streak_freezes"],
        "extended_today": user["streak_last_date"] == today.isoformat(),
        "week_activity": [
            {
                "date": (week_start + timedelta(days=i)).isoformat(),
                "active": (week_start + timedelta(days=i)).isoformat() in days,
            }
            for i in range(7)
        ],
        "total_xp": total_xp(conn, user_id),
        "today_xp": xp_on_day(conn, user_id, today),
        "daily_goal_xp": user["daily_goal_xp"],
        "daily_goal_options": DAILY_GOALS,
        "settings": get_settings(conn, user_id),
        "today": today.isoformat(),
        "now": clock.iso(now),
    }

