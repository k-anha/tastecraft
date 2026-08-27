from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=False)
    cuisine_type = Column(String(100), index=True, nullable=False)
    price_range = Column(Integer, default=2)  # 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
    address = Column(String(255), nullable=False)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    phone_number = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    opening_hours = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    features = Column(Text, nullable=True)
    owner_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="owned_restaurants")
    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="restaurant", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # Appetizers, Mains, Desserts, Drinks, Specials
    price = Column(Float, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_signature = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="menu_items")
    dish_reviews = relationship("DishReview", back_populates="menu_item")
