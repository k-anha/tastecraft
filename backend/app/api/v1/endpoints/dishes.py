from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.api.deps import get_db, get_current_user
from app.models.restaurant import Restaurant, MenuItem
from app.models.review import DishReview
from app.models.user import User
from app.schemas.restaurant import MenuItemCreate, MenuItemOut
from app.schemas.review import DishReviewOut

router = APIRouter()

@router.get("/restaurant/{restaurant_id}", response_model=List[MenuItemOut])
def get_restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    menu_items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
    return menu_items

@router.post("/restaurant/{restaurant_id}", response_model=MenuItemOut, status_code=status.HTTP_201_CREATED)
def add_menu_item(
    restaurant_id: int,
    item_in: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")
    
    if restaurant.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to add menu items")

    menu_item = MenuItem(
        restaurant_id=restaurant_id,
        name=item_in.name,
        description=item_in.description,
        category=item_in.category,
        price=item_in.price,
        image_url=item_in.image_url,
        is_signature=item_in.is_signature or False
    )
    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)
    return menu_item

@router.get("/dish-comments/{dish_name}", response_model=List[DishReviewOut])
def get_comments_for_dish(dish_name: str, db: Session = Depends(get_db)):
    comments = (
        db.query(DishReview)
        .filter(DishReview.dish_name.ilike(f"%{dish_name}%"))
        .order_by(desc(DishReview.created_at))
        .limit(20)
        .all()
    )
    return comments

