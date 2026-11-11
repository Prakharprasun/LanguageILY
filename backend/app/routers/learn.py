from fastapi import APIRouter

from app.deps import CurrentUser, Db
from app.errors import AppError
from app.services import path as path_service, users as user_service

router = APIRouter(prefix="/api", tags=["learn"])


@router.get("/courses")
def list_courses(conn: Db):
    rows = conn.execute(
        """SELECT c.id, c.language_code, c.title, c.flag_src, c.speech_locale,
                  COUNT(u.id) AS unit_count
           FROM courses c
           LEFT JOIN units u ON u.course_id = c.id
           GROUP BY c.id
           ORDER BY c.id"""
    ).fetchall()
    return [dict(r) for r in rows]


@router.get("/path")
def get_path(conn: Db, user_id: CurrentUser):
    """The learning path of the learner's active course with each node's state."""
    user = user_service.sync_user(conn, user_id)
    if not user["active_course_id"]:
        raise AppError("no_active_course", "Pick a course first.")
    return path_service.build_path(conn, user_id, user["active_course_id"])


@router.get("/units/{unit_id}/guidebook")
def get_guidebook(unit_id: int, conn: Db, _: CurrentUser):
    return path_service.guidebook(conn, unit_id)

