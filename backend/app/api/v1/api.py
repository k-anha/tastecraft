from fastapi import APIRouter
from app.api.v1.endpoints import auth, restaurants, reviews, dishes, bookmarks

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["Restaurants"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews & Food Comments"])
api_router.include_router(dishes.router, prefix="/dishes", tags=["Dishes & Menus"])
api_router.include_router(bookmarks.router, prefix="/bookmarks", tags=["Bookmarks"])

