"""Simulated clock.

Streaks, daily goals and heart regeneration all depend on time. To make them
testable, "now" is the real UTC time shifted by a day offset stored in the
database. POST /api/dev/advance-day moves the clock forward.
"""

import sqlite3
from datetime import date, datetime, timedelta, timezone


def get_day_offset(conn: sqlite3.Connection) -> int:
    row = conn.execute("SELECT value FROM app_meta WHERE key = 'day_offset'").fetchone()
    return int(row["value"]) if row else 0


def set_day_offset(conn: sqlite3.Connection, offset: int) -> None:
    conn.execute(
        "INSERT INTO app_meta (key, value) VALUES ('day_offset', ?) "
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (str(offset),),
    )


def now(conn: sqlite3.Connection) -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0) + timedelta(days=get_day_offset(conn))


def today(conn: sqlite3.Connection) -> date:
    return now(conn).date()


def iso(dt: datetime) -> str:
    return dt.isoformat()


def parse(value: str) -> datetime:
    return datetime.fromisoformat(value)


def day_bounds(day: date) -> tuple[str, str]:
    """ISO strings for [day 00:00, next day 00:00), handy for range queries on created_at."""
    start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
    return iso(start), iso(start + timedelta(days=1))


def week_start(day: date) -> date:
    """Leagues run Monday to Sunday."""
    return day - timedelta(days=day.weekday())

