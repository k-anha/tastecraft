import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token, generate_user_id
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserUpdate, UserOut, Token

router = APIRouter()

COUNTRY_DIAL_MAP = {
    "+91": "India",
    "+1": "America",
    "+86": "China",
    "+81": "Japan",
}

def clean_phone_digits(phone: Optional[str]) -> Optional[str]:
    """Strip all spaces, hyphens, parentheses, and non-digits from a phone number string"""
    if not phone:
        return None
    digits = re.sub(r'\D', '', str(phone))
    return digits if digits else None

def normalize_country_code(cc: Optional[str]) -> str:
    """Normalize country code to have leading + (e.g. 91 -> +91, +91 -> +91)"""
    if not cc:
        return "+91"
    cc_clean = cc.strip()
    if not cc_clean.startswith("+"):
        cc_clean = f"+{cc_clean}"
    return cc_clean

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if email already registered
    if db.query(User).filter(User.email == user_in.email.strip()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    # Check if username taken
    if db.query(User).filter(User.username == user_in.username.strip()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists."
        )

    # Process and sanitize phone number (digits only), country_code, and country name
    clean_phone = clean_phone_digits(user_in.phone_number)
    clean_cc = normalize_country_code(user_in.country_code)
    country_name = user_in.country or COUNTRY_DIAL_MAP.get(clean_cc, "India")

    if clean_phone:
        existing_phone = db.query(User).filter(
            and_(User.country_code == clean_cc, User.phone_number == clean_phone)
        ).first()
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this contact number and country code already exists."
            )

    user_id = generate_user_id()

    user = User(
        id=user_id,
        email=user_in.email.strip(),
        username=user_in.username.strip(),
        country=country_name,
        country_code=clean_cc,
        phone_number=clean_phone,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name or user_in.username,
        role=user_in.role or "user",
        accepts_promotions=user_in.accepts_promotions if user_in.accepts_promotions is not None else True,
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.username}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = None

    # Mode 2: Mobile Number Login
    if login_data.phone_number and login_data.phone_number.strip():
        clean_phone = clean_phone_digits(login_data.phone_number)
        clean_cc = normalize_country_code(login_data.country_code) if login_data.country_code else None

        if clean_cc:
            user = db.query(User).filter(
                and_(User.country_code == clean_cc, User.phone_number == clean_phone)
            ).first()

        # Fallback without matching country code if not matched
        if not user:
            user = db.query(User).filter(User.phone_number == clean_phone).first()

        # Fallback matching last 10 or 11 digits
        if not user and clean_phone and len(clean_phone) > 10:
            user = db.query(User).filter(User.phone_number == clean_phone[-10:]).first()

    # Mode 1: Email or Username Login
    elif login_data.email_or_username and login_data.email_or_username.strip():
        identifier = login_data.email_or_username.strip()
        clean_digits = clean_phone_digits(identifier)

        filters = [
            User.email == identifier,
            User.username == identifier
        ]
        if clean_digits:
            filters.append(User.phone_number == clean_digits)

        user = db.query(User).filter(or_(*filters)).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials or password. Please check and try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.country is not None:
        current_user.country = user_update.country
    if user_update.country_code is not None:
        current_user.country_code = normalize_country_code(user_update.country_code)
    if user_update.phone_number is not None:
        current_user.phone_number = clean_phone_digits(user_update.phone_number)
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.accepts_promotions is not None:
        current_user.accepts_promotions = user_update.accepts_promotions
    if user_update.password:
        current_user.hashed_password = get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/users/{user_id}", response_model=UserOut)
def get_user_by_id(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == str(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
