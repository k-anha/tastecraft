from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.core.security import generate_user_id

class User(Base):
    __tablename__ = "users"

    # User ID generated with clean hex code (e.g. a18b9c2d1e4f)
    id = Column(String(64), primary_key=True, default=generate_user_id, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    country = Column(String(100), nullable=True, default="India")          # Country Name: 'India', 'America', 'China', 'Japan'
    country_code = Column(String(10), nullable=True, default="+91")       # Dial Code: '+91', '+1', '+86', '+81'
    phone_number = Column(String(20), index=True, nullable=True)          # Contact number without spaces (digits only)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    role = Column(String(50), default="user")  # "user", "owner", "admin"
    accepts_promotions = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    owned_restaurants = relationship("Restaurant", back_populates="owner")
    comments = relationship("ReviewComment", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("ReviewLike", back_populates="user", cascade="all, delete-orphan")
