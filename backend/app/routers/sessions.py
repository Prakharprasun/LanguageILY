from fastapi import APIRouter

from app.deps import CurrentUser, Db
from app.schemas import AnswerIn, PracticeIn
from app.services import sessions as session_service

router = APIRouter(prefix="/api", tags=["lessons"])


@router.post("/lessons/{lesson_id}/sessions", status_code=201)
def start_lesson(lesson_id: int, conn: Db, user_id: CurrentUser):
    """Starts a lesson. 403 if locked, 409 `out_of_hearts` if the learner has no hearts."""
    return session_service.start_lesson(conn, user_id, lesson_id)


@router.post("/practice/sessions", status_code=201)
def start_practice(body: PracticeIn, conn: Db, user_id: CurrentUser):
    """Practice from completed lessons (optionally one skill). Earns a heart back."""
    return session_service.start_practice(conn, user_id, body.skill_id)


@router.post("/sessions/{session_id}/answers")
def submit_answer(session_id: int, body: AnswerIn, conn: Db, user_id: CurrentUser):
    """Grades one answer. A wrong answer in a lesson costs a heart."""
    return session_service.submit_answer(conn, user_id, session_id, body.exercise_id, body.answer)


@router.post("/sessions/{session_id}/complete")
def complete_session(session_id: int, conn: Db, user_id: CurrentUser):
    """Finishes a session: awards XP, extends the streak, rewards quests, unlocks achievements."""
    return session_service.complete_session(conn, user_id, session_id)

