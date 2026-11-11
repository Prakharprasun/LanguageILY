"""End-to-end tests for the FastAPI backend and SQLite schema."""

import json
import os
import tempfile
import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client():
    fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    os.environ["DATABASE_PATH"] = temp_db
    # Reload config / db path
    import app.config as cfg
    import app.db as db_mod
    from pathlib import Path

    cfg.DATABASE_PATH = Path(temp_db)
    db_mod.DATABASE_PATH = Path(temp_db)

    from app.main import app
    from seed.seed import seed

    conn = db_mod.connect(temp_db)
    seed(conn)
    conn.commit()
    conn.close()

    with TestClient(app) as c:
        yield c

    if os.path.exists(temp_db):
        os.remove(temp_db)


def test_me_and_path(client: TestClient):
    res = client.get("/api/me")
    assert res.status_code == 200
    me = res.json()
    assert me["username"] == "romeo"
    assert me["hearts"] == 5
    assert me["streak"] == 5
    assert me["total_xp"] > 0

    path_res = client.get("/api/path")
    assert path_res.status_code == 200
    path = path_res.json()
    assert len(path["units"]) == 3
    # First skill has 2 lessons both completed in seed
    first_skill = path["units"][0]["skills"][0]
    assert first_skill["state"] == "completed"
    # Second skill has 1 of 2 lessons completed -> active
    second_skill = path["units"][0]["skills"][1]
    assert second_skill["state"] == "active"
    assert second_skill["lessons_completed"] == 1


def test_lesson_loop_all_exercise_types(client: TestClient):
    path = client.get("/api/path").json()
    active_lesson_id = path["active_lesson_id"]
    assert active_lesson_id is not None

    # Locked lesson should 403
    locked_skill = path["units"][0]["skills"][2]
    locked_res = client.post(f"/api/lessons/{locked_skill['next_lesson_id']}/sessions")
    assert locked_res.status_code == 403

    # Start active lesson
    sess_res = client.post(f"/api/lessons/{active_lesson_id}/sessions")
    assert sess_res.status_code == 201
    payload = sess_res.json()
    session_id = payload["session"]["id"]
    exercises = payload["exercises"]
    assert len(exercises) == 6
    seen_types = {e["type"] for e in exercises}
    assert seen_types == {
        "MULTIPLE_CHOICE",
        "TRANSLATE",
        "MATCH_PAIRS",
        "FILL_BLANK",
        "TYPE_ANSWER",
    }

    # Intentionally submit 1 wrong answer to verify heart loss
    first_ex = exercises[0]
    wrong_res = client.post(
        f"/api/sessions/{session_id}/answers",
        json={"exercise_id": first_ex["id"], "answer": "definitely_wrong"},
    )
    assert wrong_res.status_code == 200
    wrong_data = wrong_res.json()
    assert wrong_data["correct"] is False
    assert wrong_data["hearts"] == 4

    # Now answer every exercise in the session correctly
    import app.db as db_mod
    conn = db_mod.connect()
    for ex in exercises:
        ex_id = ex["id"]
        if ex["type"] in ("MULTIPLE_CHOICE", "FILL_BLANK"):
            corr = conn.execute(
                "SELECT id FROM exercise_options WHERE exercise_id = ? AND is_correct = 1",
                (ex_id,),
            ).fetchone()["id"]
            ans = str(corr)
        elif ex["type"] == "MATCH_PAIRS":
            opts = conn.execute(
                "SELECT id FROM exercise_options WHERE exercise_id = ?", (ex_id,)
            ).fetchall()
            ans = json.dumps([[o["id"], o["id"]] for o in opts])
        else:
            sol = conn.execute(
                "SELECT solution FROM exercises WHERE id = ?", (ex_id,)
            ).fetchone()["solution"]
            ans = sol
        r = client.post(
            f"/api/sessions/{session_id}/answers",
            json={"exercise_id": ex_id, "answer": ans},
        )
        assert r.status_code == 200
        assert r.json()["correct"] is True
    conn.close()

    # Complete the lesson
    comp_res = client.post(f"/api/sessions/{session_id}/complete")
    assert comp_res.status_code == 200
    comp = comp_res.json()
    assert comp["xp_earned"] == 10
    assert comp["skill_completed"] is True


def test_practice_and_shop_and_streak_advance(client: TestClient):
    # Lose a heart, then practice to regain it
    path = client.get("/api/path").json()
    sess = client.post(f"/api/lessons/{path['active_lesson_id']}/sessions").json()
    client.post(
        f"/api/sessions/{sess['session']['id']}/answers",
        json={"exercise_id": sess["exercises"][0]["id"], "answer": "wrong"},
    )
    assert client.get("/api/me").json()["hearts"] == 4

    # Refill hearts in shop
    shop_res = client.post("/api/shop/purchases", json={"item_id": "refill_hearts"})
    assert shop_res.status_code == 200
    assert client.get("/api/me").json()["hearts"] == 5

    # Advance 1 day -> streak still intact
    client.post("/api/dev/advance-day", json={"days": 1})
    me_next = client.get("/api/me").json()
    assert me_next["streak"] == 5
    assert me_next["extended_today"] is False

    # Leaderboard & Profile
    lb = client.get("/api/leaderboard").json()
    assert len(lb["entries"]) == 15
    prof = client.get("/api/users/1/profile").json()
    assert prof["stats"]["streak"] == 5
    assert len(prof["achievements"]) == 6

    # Switch to Korean course (id=2) and verify its 3 units and lessons work
    courses = client.get("/api/courses").json()
    kr_course = next(c for c in courses if c["language_code"] == "kr")
    client.patch("/api/me", json={"active_course_id": kr_course["id"]})
    kr_path = client.get("/api/path").json()
    assert kr_path["course"]["title"] == "Korean"
    assert len(kr_path["units"]) == 3
    kr_sess = client.post(f"/api/lessons/{kr_path['active_lesson_id']}/sessions")
    assert kr_sess.status_code == 201
    assert kr_sess.json()["speech_locale"] == "ko-KR"

