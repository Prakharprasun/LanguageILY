from fastapi import APIRouter

from app.deps import CurrentUser, Db
from app.schemas import ProfileUpdate, SettingsUpdate
from app.services import profile as profile_service, users as user_service

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/users")
def list_users(conn: Db):
    """Learners available in the account switcher (auth is simplified)."""
    rows = conn.execute(
        "SELECT id, display_name, username, avatar_color FROM users ORDER BY id"
    ).fetchall()
    return [dict(r) for r in rows]


@router.get("/me")
def get_me(conn: Db, user_id: CurrentUser):
    return user_service.user_summary(conn, user_id)


@router.patch("/me")
def update_me(body: ProfileUpdate, conn: Db, user_id: CurrentUser):
    changes = body.model_dump(exclude_none=True)
    if changes:
        assignments = ", ".join(f"{column} = ?" for column in changes)
        conn.execute(
            f"UPDATE users SET {assignments} WHERE id = ?", (*changes.values(), user_id)
        )
    return user_service.user_summary(conn, user_id)


@router.patch("/me/settings")
def update_settings(body: SettingsUpdate, conn: Db, user_id: CurrentUser):
    user_service.get_settings(conn, user_id)  # makes sure the row exists
    changes = body.model_dump(exclude_none=True)
    if changes:
        assignments = ", ".join(f"{column} = ?" for column in changes)
        conn.execute(
            f"UPDATE user_settings SET {assignments} WHERE user_id = ?",
            (*(int(v) for v in changes.values()), user_id),
        )
    return user_service.get_settings(conn, user_id)


@router.get("/users/{profile_id}/profile")
def get_profile(profile_id: int, conn: Db, _: CurrentUser):
    return profile_service.profile(conn, profile_id)

