from fastapi import APIRouter

from app.deps import CurrentUser, Db
from app.schemas import PurchaseIn
from app.services import gamification, shop as shop_service

router = APIRouter(prefix="/api", tags=["gamification"])


@router.get("/leaderboard")
def get_leaderboard(conn: Db, user_id: CurrentUser):
    return gamification.leaderboard(conn, user_id)


@router.get("/quests")
def get_quests(conn: Db, user_id: CurrentUser):
    return gamification.daily_quests(conn, user_id)


@router.get("/shop")
def get_shop(conn: Db, user_id: CurrentUser):
    return shop_service.catalog(conn, user_id)


@router.post("/shop/purchases")
def purchase(body: PurchaseIn, conn: Db, user_id: CurrentUser):
    return shop_service.purchase(conn, user_id, body.item_id)

