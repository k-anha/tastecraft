from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# --- MenuItem Schemas ---
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str  # Appetizers, Mains, Desserts, Drinks, Specials
    price: float
    image_url: Optional[str] = None
    is_signature: Optional[bool] = False

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    is_signature: Optional[bool] = None

class MenuItemOut(MenuItemBase):
    id: int
    restaurant_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Rating Breakdown Stats ---
class RestaurantRatingStats(BaseModel):
    review_count: int = 0
    avg_overall_rating: float = 0.0
    avg_food_rating: float = 0.0
    avg_price_rating: float = 0.0
    avg_service_rating: float = 0.0
    avg_ambiance_rating: float = 0.0


# --- Restaurant Schemas ---
class RestaurantBase(BaseModel):
    name: str
    description: str
    cuisine_type: str
    price_range: int = 2  # 1 to 4 ($ to $$$$)
    address: str
    city: str
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone_number: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    image_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    features: Optional[str] = None  # Comma-separated tags

class RestaurantCreate(RestaurantBase):
    menu_items: Optional[List[MenuItemCreate]] = None

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    price_range: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone_number: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    image_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    features: Optional[str] = None

class RestaurantOut(RestaurantBase):
    id: int
    owner_id: Optional[str] = None  # String clean hex code
    created_at: datetime
    stats: Optional[RestaurantRatingStats] = None
    is_bookmarked: Optional[bool] = False

    class Config:
        from_attributes = True

class RestaurantDetailOut(RestaurantOut):
    menu_items: List[MenuItemOut] = []
    
    class Config:
        from_attributes = True
