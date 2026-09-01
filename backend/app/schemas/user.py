from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    username: str
    gender: Optional[str] = None
    country: Optional[str] = "India"
    country_code: Optional[str] = "+91"
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = "user"
    accepts_promotions: Optional[bool] = True

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    gender: Optional[str] = None
    country: Optional[str] = "India"
    country_code: Optional[str] = "+91"
    phone_number: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = "user"
    accepts_promotions: Optional[bool] = True

class UserLogin(BaseModel):
    # Mode 1: Email or Username login
    email_or_username: Optional[str] = None
    # Mode 2: Mobile number login
    phone_number: Optional[str] = None
    country_code: Optional[str] = None
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    accepts_promotions: Optional[bool] = None

class UserOut(UserBase):
    id: str  # Clean alphanumeric hex ID (e.g. a18b9c2d1e4f)
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
