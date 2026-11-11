"""Request bodies. Responses are plain dicts built by the services."""

from typing import Literal

from pydantic import BaseModel, Field


class AnswerIn(BaseModel):
    exercise_id: int
    # option id for choice exercises, free text for translate/type,
    # JSON list of [left_id, right_id] for match pairs
    answer: str = Field(max_length=500)


class PracticeIn(BaseModel):
    skill_id: int | None = None


class PurchaseIn(BaseModel):
    item_id: Literal["refill_hearts", "streak_freeze"]


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=40)
    daily_goal_xp: int | None = Field(default=None, gt=0, le=200)
    active_course_id: int | None = None


class SettingsUpdate(BaseModel):
    sound_effects: bool | None = None
    animations: bool | None = None
    motivational_messages: bool | None = None
    listening_exercises: bool | None = None


class AdvanceDayIn(BaseModel):
    days: int = Field(default=1, ge=1, le=30)

