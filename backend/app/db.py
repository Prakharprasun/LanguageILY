"""SQLite connection handling.

We use the standard library sqlite3 module directly with hand written SQL:
the schema is small, and explicit queries keep the data access easy to follow.
"""

import sqlite3
from collections.abc import Iterator
from pathlib import Path

import app.config as config

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def connect(path: Path | str | None = None) -> sqlite3.Connection:
    target = Path(path if path is not None else config.DATABASE_PATH)
    target.parent.mkdir(parents=True, exist_ok=True)
    # FastAPI may run a dependency and its endpoint on different worker threads,
    # each request still gets its own connection.
    conn = sqlite3.connect(target, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_PATH.read_text())


def is_seeded(conn: sqlite3.Connection) -> bool:
    row = conn.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'courses'"
    ).fetchone()
    if row is None:
        return False
    return conn.execute("SELECT COUNT(*) FROM courses").fetchone()[0] > 0


def get_db() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency: one connection per request, one transaction per request."""
    conn = connect()
    try:
        if not is_seeded(conn):
            from seed.seed import seed

            seed(conn)
            conn.commit()
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

