from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    
    # Multi-dimensional criteria rating (1.0 to 5.0)
    food_rating = Column(Float, nullable=False)
    price_rating = Column(Float, nullable=False)
    service_rating = Column(Float, nullable=False)
    ambiance_rating = Column(Float, nullable=False)
    overall_rating = Column(Float, nullable=False)
    
    visit_date = Column(String(50), nullable=True)
    images = Column(Text, nullable=True)  # JSON-encoded array of image URLs
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    dish_reviews = relationship("DishReview", back_populates="review", cascade="all, delete-orphan")
    comments = relationship("ReviewComment", back_populates="review", cascade="all, delete-orphan")
    likes = relationship("ReviewLike", back_populates="review", cascade="all, delete-orphan")


class DishReview(Base):
    __tablename__ = "dish_reviews"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=True)
    dish_name = Column(String(255), nullable=False)
    sentiment = Column(String(50), default="recommended")  # "recommended", "neutral", "not_recommended"
    rating = Column(Float, nullable=True)  # 1.0 to 5.0
    comment = Column(Text, nullable=False)  # Specific tasting commentary
    price_paid = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    review = relationship("Review", back_populates="dish_reviews")
    menu_item = relationship("MenuItem", back_populates="dish_reviews")


class ReviewComment(Base):
    __tablename__ = "review_comments"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_owner_response = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    review = relationship("Review", back_populates="comments")
    user = relationship("User", back_populates="comments")


class ReviewLike(Base):
    __tablename__ = "review_likes"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=False)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    review = relationship("Review", back_populates="likes")
    user = relationship("User", back_populates="likes")
