from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, get_current_user
from app.models.bookmark import Bookmark
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.bookmark import BookmarkCreate, BookmarkOut
from app.schemas.restaurant import RestaurantOut
from app.api.v1.endpoints.restaurants import get_restaurant_stats

router = APIRouter()

@router.get("", response_model=List[RestaurantOut])
def get_user_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookmarks = (
        db.query(Bookmark)
        .filter(Bookmark.user_id == current_user.id)
        .order_by(desc(Bookmark.created_at))
        .all()
    )
    
    result = []
    for b in bookmarks:
        r = b.restaurant
        if not r:
            continue
        stats = get_restaurant_stats(db, r.id)
        result.append(RestaurantOut(
            id=r.id,
            name=r.name,
            description=r.description,
            cuisine_type=r.cuisine_type,
            price_range=r.price_range,
            address=r.address,
            city=r.city,
            state=r.state,
            zip_code=r.zip_code,
            phone_number=r.phone_number,
            website=r.website,
            opening_hours=r.opening_hours,
            image_url=r.image_url,
            cover_image_url=r.cover_image_url,
            features=r.features,
            owner_id=r.owner_id,
            created_at=r.created_at,
            stats=stats,
            is_bookmarked=True
        ))
    return result

@router.post("/toggle/{restaurant_id}")
def toggle_bookmark(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    existing = db.query(Bookmark).filter(
        Bookmark.restaurant_id == restaurant_id,
        Bookmark.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"is_bookmarked": False, "message": "Restaurant removed from bookmarks"}
    else:
        bookmark = Bookmark(restaurant_id=restaurant_id, user_id=current_user.id)
        db.add(bookmark)
        db.commit()
        return {"is_bookmarked": True, "message": "Restaurant added to bookmarks"}

