"""Game rules and app settings. Values live in one place so they are easy to tune."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

_default_db_dir = Path("/tmp") if os.environ.get("VERCEL") else (BASE_DIR / "data")
DATABASE_PATH = Path(os.environ.get("DATABASE_PATH", _default_db_dir / "duolingo.db"))

# Comma separated list of allowed frontend origins ("*" allows every origin).
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]

# Auth is simplified: requests carry an X-User-Id header, defaulting to the seeded learner.
DEFAULT_USER_ID = 1

# Hearts
MAX_HEARTS = 5
HEART_REGEN_MINUTES = 30

# XP
PERFECT_LESSON_BONUS_XP = 5
PRACTICE_XP = 5
PRACTICE_SESSION_SIZE = 8

# Daily goal presets (label -> XP), same choices as Duolingo
DAILY_GOALS = {"Casual": 10, "Regular": 20, "Serious": 30, "Intense": 50}

# Shop (gems are a mocked currency)
HEART_REFILL_COST = 350
STREAK_FREEZE_COST = 200
MAX_STREAK_FREEZES = 2

# Leaderboard
LEAGUE_NAME = "Bronze"
LEAGUE_PROMOTION_SPOTS = 5
LEAGUE_DEMOTION_SPOTS = 3

