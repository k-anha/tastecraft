from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc

from app.api.deps import get_db, get_current_user, get_optional_current_user
from app.models.restaurant import Restaurant, MenuItem
from app.models.review import Review
from app.models.bookmark import Bookmark
from app.models.user import User
from app.schemas.restaurant import (
    RestaurantCreate, RestaurantUpdate, RestaurantOut, RestaurantDetailOut, 
    RestaurantRatingStats, MenuItemCreate, MenuItemUpdate, MenuItemOut,
    MenuItemWithRestaurantOut
)

router = APIRouter()

def get_restaurant_stats(db: Session, restaurant_id: int) -> RestaurantRatingStats:
    stats = db.query(
        func.count(Review.id).label("count"),
        func.avg(Review.overall_rating).label("avg_overall"),
        func.avg(Review.food_rating).label("avg_food"),
        func.avg(Review.price_rating).label("avg_price"),
        func.avg(Review.service_rating).label("avg_service"),
        func.avg(Review.ambiance_rating).label("avg_ambiance"),
    ).filter(Review.restaurant_id == restaurant_id).first()

    if not stats or stats.count == 0:
        return RestaurantRatingStats()
    
    return RestaurantRatingStats(
        review_count=stats.count or 0,
        avg_overall_rating=round(float(stats.avg_overall or 0), 1),
        avg_food_rating=round(float(stats.avg_food or 0), 1),
        avg_price_rating=round(float(stats.avg_price or 0), 1),
        avg_service_rating=round(float(stats.avg_service or 0), 1),
        avg_ambiance_rating=round(float(stats.avg_ambiance or 0), 1),
    )

@router.get("", response_model=List[RestaurantOut])
def get_restaurants(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
    search: Optional[str] = None,
    cuisine: Optional[str] = None,
    price_range: Optional[int] = None,
    min_rating: Optional[float] = None,
    city: Optional[str] = None,
    sort_by: Optional[str] = Query("highest_rated", enum=["highest_rated", "most_reviewed", "newest", "price_asc", "price_desc"]),
    limit: int = 50,
    offset: int = 0
):
    query = db.query(Restaurant)

    # Search filter across name, description, address, city, cuisine
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Restaurant.name.ilike(search_filter),
                Restaurant.description.ilike(search_filter),
                Restaurant.cuisine_type.ilike(search_filter),
                Restaurant.city.ilike(search_filter),
                Restaurant.address.ilike(search_filter),
                Restaurant.features.ilike(search_filter),
            )
        )

    if cuisine and cuisine.lower() != "all":
        query = query.filter(Restaurant.cuisine_type.ilike(cuisine))

    if price_range:
        query = query.filter(Restaurant.price_range == price_range)

    if city and city.lower() != "all":
        query = query.filter(Restaurant.city.ilike(city))

    restaurants = query.all()

    # User bookmarked IDs set for fast check
    bookmarked_ids = set()
    if current_user:
        bookmarked_ids = {
            b.restaurant_id for b in db.query(Bookmark.restaurant_id).filter(Bookmark.user_id == current_user.id).all()
        }

    # Attach stats and filter/sort
    result = []
    for r in restaurants:
        stats = get_restaurant_stats(db, r.id)
        if min_rating and stats.avg_overall_rating < min_rating:
            continue
        
        item = RestaurantOut(
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
            is_bookmarked=r.id in bookmarked_ids
        )
        result.append(item)

    # Sorting
    if sort_by == "highest_rated":
        result.sort(key=lambda x: (x.stats.avg_overall_rating if x.stats else 0, x.stats.review_count if x.stats else 0), reverse=True)
    elif sort_by == "most_reviewed":
        result.sort(key=lambda x: x.stats.review_count if x.stats else 0, reverse=True)
    elif sort_by == "newest":
        result.sort(key=lambda x: x.created_at, reverse=True)
    elif sort_by == "price_asc":
        result.sort(key=lambda x: x.price_range)
    elif sort_by == "price_desc":
        result.sort(key=lambda x: x.price_range, reverse=True)

    return result[offset : offset + limit]

@router.get("/cuisines", response_model=List[dict])
def get_cuisines(db: Session = Depends(get_db)):
    results = db.query(Restaurant.cuisine_type, func.count(Restaurant.id)).group_by(Restaurant.cuisine_type).all()
    return [{"cuisine": row[0], "count": row[1]} for row in results]

@router.get("/cities", response_model=List[dict])
def get_cities(db: Session = Depends(get_db)):
    results = db.query(Restaurant.city, func.count(Restaurant.id)).group_by(Restaurant.city).all()
    return [{"city": row[0], "count": row[1]} for row in results]

@router.get("/{restaurant_id}", response_model=RestaurantDetailOut)
def get_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    stats = get_restaurant_stats(db, restaurant_id)
    is_bookmarked = False
    if current_user:
        is_bookmarked = db.query(Bookmark).filter(
            Bookmark.restaurant_id == restaurant_id,
            Bookmark.user_id == current_user.id
        ).first() is not None

    menu_items = [MenuItemOut.model_validate(item) for item in restaurant.menu_items]

    return RestaurantDetailOut(
        id=restaurant.id,
        name=restaurant.name,
        description=restaurant.description,
        cuisine_type=restaurant.cuisine_type,
        price_range=restaurant.price_range,
        address=restaurant.address,
        city=restaurant.city,
        state=restaurant.state,
        zip_code=restaurant.zip_code,
        phone_number=restaurant.phone_number,
        website=restaurant.website,
        opening_hours=restaurant.opening_hours,
        image_url=restaurant.image_url,
        cover_image_url=restaurant.cover_image_url,
        features=restaurant.features,
        owner_id=restaurant.owner_id,
        created_at=restaurant.created_at,
        stats=stats,
        is_bookmarked=is_bookmarked,
        menu_items=menu_items
    )

@router.post("", response_model=RestaurantDetailOut, status_code=status.HTTP_201_CREATED)
def create_restaurant(
    restaurant_in: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Enforce that only restaurant owners or admins can register a new restaurant listing
    if current_user.role != "owner" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered restaurant owners can register a new restaurant. Please update your account role to owner in your profile or during registration."
        )

    # Use restaurant owner's profile contact number if not explicitly specified
    restaurant_phone = restaurant_in.phone_number
    if not restaurant_phone and current_user.phone_number:
        restaurant_phone = f"{current_user.country_code or ''} {current_user.phone_number}".strip()

    restaurant = Restaurant(
        name=restaurant_in.name,
        description=restaurant_in.description,
        cuisine_type=restaurant_in.cuisine_type,
        price_range=restaurant_in.price_range,
        address=restaurant_in.address,
        city=restaurant_in.city,
        state=restaurant_in.state,
        zip_code=restaurant_in.zip_code,
        phone_number=restaurant_phone,
        website=restaurant_in.website,
        opening_hours=restaurant_in.opening_hours,
        image_url=restaurant_in.image_url or "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
        cover_image_url=restaurant_in.cover_image_url or restaurant_in.image_url or "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
        features=restaurant_in.features,
        owner_id=current_user.id
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    # Add menu items if provided
    if restaurant_in.menu_items:
        for m in restaurant_in.menu_items:
            menu_item = MenuItem(
                restaurant_id=restaurant.id,
                name=m.name,
                description=m.description,
                category=m.category,
                price=m.price,
                image_url=m.image_url,
                is_signature=m.is_signature or False
            )
            db.add(menu_item)
        db.commit()
        db.refresh(restaurant)

    return get_restaurant(restaurant.id, db, current_user)

@router.put("/{restaurant_id}", response_model=RestaurantDetailOut)
def update_restaurant(
    restaurant_id: int,
    restaurant_update: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    if restaurant.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this restaurant")

    for field, val in restaurant_update.model_dump(exclude_unset=True).items():
        setattr(restaurant, field, val)

    db.commit()
    db.refresh(restaurant)
    return get_restaurant(restaurant.id, db, current_user)

@router.delete("/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    if restaurant.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this restaurant")

    db.delete(restaurant)
    db.commit()
    return None

# Upload Food Items / Dishes with Images (Open to ANY authenticated food lover or owner)
@router.post("/{restaurant_id}/menu", response_model=MenuItemOut, status_code=status.HTTP_201_CREATED)
def add_menu_item(
    restaurant_id: int,
    item_in: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    menu_item = MenuItem(
        restaurant_id=restaurant.id,
        user_id=current_user.id,
        name=item_in.name.strip(),
        description=item_in.description,
        category=item_in.category or "Dishes",
        price=float(item_in.price) if item_in.price is not None else 0.0,
        image_url=item_in.image_url or "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
        is_signature=item_in.is_signature or False
    )
    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)
    return MenuItemOut.model_validate(menu_item)

# Delete Food Items from Restaurant Menu (Uploader, Owner, or Admin)
@router.delete("/{restaurant_id}/menu/{menu_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(
    restaurant_id: int,
    menu_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    menu_item = db.query(MenuItem).filter(
        MenuItem.id == menu_item_id, 
        MenuItem.restaurant_id == restaurant_id
    ).first()
    if not menu_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")

    is_uploader = menu_item.user_id == current_user.id
    is_owner = restaurant.owner_id == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_uploader or is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only the user who added this dish or the restaurant owner can delete it."
        )

    db.delete(menu_item)
    db.commit()
    return None

# Edit Food Items in Restaurant Menu (Uploader, Owner, or Admin)
@router.put("/{restaurant_id}/menu/{menu_item_id}", response_model=MenuItemOut)
def update_menu_item(
    restaurant_id: int,
    menu_item_id: int,
    item_update: MenuItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    menu_item = db.query(MenuItem).filter(
        MenuItem.id == menu_item_id, 
        MenuItem.restaurant_id == restaurant_id
    ).first()
    if not menu_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")

    is_uploader = menu_item.user_id == current_user.id
    is_owner = restaurant.owner_id == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_uploader or is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only the user who added this dish or the restaurant owner can edit it."
        )

    for field, val in item_update.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(menu_item, field, val)

    db.commit()
    db.refresh(menu_item)
    return MenuItemOut.model_validate(menu_item)

# Get all dishes/food items uploaded by a specific user (across all restaurants)
@router.get("/menu/user/{user_id}", response_model=List[MenuItemWithRestaurantOut])
def get_user_uploaded_dishes(
    user_id: str,
    db: Session = Depends(get_db)
):
    items = db.query(MenuItem).join(Restaurant).filter(MenuItem.user_id == user_id).order_by(desc(MenuItem.created_at)).all()
    results = []
    for item in items:
        results.append(
            MenuItemWithRestaurantOut(
                id=item.id,
                restaurant_id=item.restaurant_id,
                restaurant_name=item.restaurant.name if item.restaurant else "Restaurant",
                restaurant_city=item.restaurant.city if item.restaurant else None,
                name=item.name,
                description=item.description,
                category=item.category,
                price=item.price,
                image_url=item.image_url,
                is_signature=item.is_signature,
                user_id=item.user_id,
                created_at=item.created_at
            )
        )
    return results

# Claim Ownership of an Unclaimed Restaurant (Owner Only)
@router.post("/{restaurant_id}/claim", response_model=RestaurantDetailOut)
def claim_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "owner" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered restaurant owners can claim a restaurant listing."
        )

    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    if restaurant.owner_id and restaurant.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This restaurant is already claimed by another owner."
        )

    restaurant.owner_id = current_user.id
    if not restaurant.phone_number and current_user.phone_number:
        restaurant.phone_number = f"{current_user.country_code or ''} {current_user.phone_number}".strip()

    db.commit()
    db.refresh(restaurant)
    return get_restaurant(restaurant.id, db, current_user)
