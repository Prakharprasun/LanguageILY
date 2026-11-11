"""Developer tools to make time-based mechanics testable from the UI."""

from fastapi import APIRouter

from app import clock
from app.deps import Db
from app.schemas import AdvanceDayIn

router = APIRouter(prefix="/api/dev", tags=["dev"])


@router.get("/clock")
def get_clock(conn: Db):
    return {"now": clock.iso(clock.now(conn)), "day_offset": clock.get_day_offset(conn)}


@router.post("/advance-day")
def advance_day(body: AdvanceDayIn, conn: Db):
    """Moves the simulated clock forward. Skipping 2+ days breaks streaks
    (unless covered by streak freezes) and hearts regenerate."""
    clock.set_day_offset(conn, clock.get_day_offset(conn) + body.days)
    return {"now": clock.iso(clock.now(conn)), "day_offset": clock.get_day_offset(conn)}


@router.post("/reset")
def reset(conn: Db):
    """Re-creates the database from the seed (all progress is lost)."""
    from seed.seed import seed  # local import: seeding is a dev-only concern

    seed(conn)
    return {"ok": True}

