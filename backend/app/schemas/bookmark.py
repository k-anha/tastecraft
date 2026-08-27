from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.schemas.restaurant import RestaurantOut

class BookmarkCreate(BaseModel):
    restaurant_id: int

class BookmarkOut(BaseModel):
    id: int
    user_id: str  # ff code
    restaurant_id: int
    created_at: datetime
    restaurant: Optional[RestaurantOut] = None

    class Config:
        from_attributes = True
