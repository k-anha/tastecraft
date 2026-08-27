from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.user import UserOut

# --- Dish Review (Food Comments) ---
class DishReviewBase(BaseModel):
    dish_name: str
    menu_item_id: Optional[int] = None
    sentiment: Optional[str] = "recommended"  # "recommended", "neutral", "not_recommended"
    rating: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    comment: str
    price_paid: Optional[float] = None

class DishReviewCreate(DishReviewBase):
    pass

class DishReviewOut(DishReviewBase):
    id: int
    review_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Review Comment (Discussion / Owner response) ---
class ReviewCommentBase(BaseModel):
    content: str

class ReviewCommentCreate(ReviewCommentBase):
    pass

class ReviewCommentOut(ReviewCommentBase):
    id: int
    review_id: int
    user_id: str  # ff code
    user: Optional[UserOut] = None
    is_owner_response: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# --- Review ---
class ReviewBase(BaseModel):
    title: str
    content: str
    food_rating: float = Field(ge=1.0, le=5.0)
    price_rating: float = Field(ge=1.0, le=5.0)
    service_rating: float = Field(ge=1.0, le=5.0)
    ambiance_rating: float = Field(ge=1.0, le=5.0)
    overall_rating: float = Field(ge=1.0, le=5.0)
    visit_date: Optional[str] = None
    images: Optional[str] = None  # JSON string of URLs e.g. '["http..."]'

class ReviewCreate(ReviewBase):
    restaurant_id: int
    dish_reviews: Optional[List[DishReviewCreate]] = []

class ReviewUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    food_rating: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    price_rating: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    service_rating: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    ambiance_rating: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    overall_rating: Optional[float] = Field(default=None, ge=1.0, le=5.0)
    visit_date: Optional[str] = None
    images: Optional[str] = None

class ReviewOut(ReviewBase):
    id: int
    restaurant_id: int
    user_id: str  # ff code
    user: Optional[UserOut] = None
    likes_count: int = 0
    is_liked_by_user: Optional[bool] = False
    created_at: datetime
    dish_reviews: List[DishReviewOut] = []
    comments: List[ReviewCommentOut] = []

    class Config:
        from_attributes = True
