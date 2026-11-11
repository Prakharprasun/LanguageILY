"""Shop: gems are a mocked currency spent on hearts and streak freezes."""

import sqlite3

from app.config import HEART_REFILL_COST, MAX_HEARTS, MAX_STREAK_FREEZES, STREAK_FREEZE_COST
from app.errors import AppError, NotFound
from app.services import users as user_service


def catalog(conn: sqlite3.Connection, user_id: int) -> dict:
    user = user_service.sync_user(conn, user_id)
    return {
        "gems": user["gems"],
        "items": [
            {
                "id": "refill_hearts",
                "section": "Hearts",
                "title": "Refill Hearts",
                "description": "Get full hearts so you can worry less about making mistakes in a lesson.",
                "cost": HEART_REFILL_COST,
                "available": user["hearts"] < MAX_HEARTS,
                "status": "FULL" if user["hearts"] >= MAX_HEARTS else None,
            },
            {
                "id": "streak_freeze",
                "section": "Power-ups",
                "title": "Streak Freeze",
                "description": "Streak Freeze allows your streak to remain in place for one full day of inactivity.",
                "cost": STREAK_FREEZE_COST,
                "available": user["streak_freezes"] < MAX_STREAK_FREEZES,
                "status": f"{user['streak_freezes']} / {MAX_STREAK_FREEZES} EQUIPPED",
            },
        ],
    }


def purchase(conn: sqlite3.Connection, user_id: int, item_id: str) -> dict:
    user = user_service.sync_user(conn, user_id)
    if item_id == "refill_hearts":
        if user["hearts"] >= MAX_HEARTS:
            raise AppError("hearts_full", "Your hearts are already full.")
        _charge(conn, user, HEART_REFILL_COST)
        user_service.set_hearts(conn, user_id, MAX_HEARTS)
    elif item_id == "streak_freeze":
        if user["streak_freezes"] >= MAX_STREAK_FREEZES:
            raise AppError("max_freezes", "You already have the maximum number of streak freezes.")
        _charge(conn, user, STREAK_FREEZE_COST)
        conn.execute(
            "UPDATE users SET streak_freezes = streak_freezes + 1 WHERE id = ?", (user_id,)
        )
    else:
        raise NotFound("Shop item")
    return catalog(conn, user_id)


def _charge(conn: sqlite3.Connection, user: sqlite3.Row, cost: int) -> None:
    if user["gems"] < cost:
        raise AppError("not_enough_gems", "You don't have enough gems.")
    conn.execute("UPDATE users SET gems = gems - ? WHERE id = ?", (cost, user["id"]))

