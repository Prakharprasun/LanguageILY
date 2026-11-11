"""Shared FastAPI dependencies."""

import sqlite3
from typing import Annotated

from fastapi import Depends, Header

from app.config import DEFAULT_USER_ID
from app.db import get_db
from app.errors import NotFound

Db = Annotated[sqlite3.Connection, Depends(get_db)]


def get_current_user_id(
    conn: Db,
    x_user_id: Annotated[int | None, Header()] = None,
) -> int:
    """Simplified authentication.

    No login: the client sends the id of the learner it acts as in an
    `X-User-Id` header and we fall back to the seeded default learner.
    This is the one place to swap in real auth (JWT/session) later.
    """
    user_id = x_user_id or DEFAULT_USER_ID
    if conn.execute("SELECT 1 FROM users WHERE id = ?", (user_id,)).fetchone() is None:
        raise NotFound("User")
    return user_id


CurrentUser = Annotated[int, Depends(get_current_user_id)]

