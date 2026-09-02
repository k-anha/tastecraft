from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, get_current_user, get_optional_current_user
from app.models.restaurant import Restaurant
from app.models.review import Review, DishReview, ReviewComment, ReviewLike
from app.models.user import User
from app.schemas.review import (
    ReviewCreate, ReviewUpdate, ReviewOut, 
    ReviewCommentCreate, ReviewCommentUpdate, ReviewCommentOut,
    ReviewCommentWithContextOut, DishReviewOut
)
from app.schemas.user import UserOut

router = APIRouter()

def build_review_out(review: Review, current_user_id: Optional[str] = None) -> ReviewOut:
    user_out = UserOut.model_validate(review.user) if review.user else None
    
    # Dish reviews
    dish_reviews = [
        DishReviewOut.model_validate(dr) for dr in review.dish_reviews
    ]
    
    # Comments with user details
    comments = []
    for c in review.comments:
        c_user_out = UserOut.model_validate(c.user) if c.user else None
        comments.append(ReviewCommentOut(
            id=c.id,
            review_id=c.review_id,
            user_id=c.user_id,
            user=c_user_out,
            content=c.content,
            is_owner_response=c.is_owner_response,
            created_at=c.created_at
        ))
    
    # Is liked by current user
    is_liked = False
    if current_user_id:
        is_liked = any(like.user_id == current_user_id for like in review.likes)
    
    return ReviewOut(
        id=review.id,
        restaurant_id=review.restaurant_id,
        user_id=review.user_id,
        user=user_out,
        title=review.title,
        content=review.content,
        food_rating=review.food_rating,
        price_rating=review.price_rating,
        service_rating=review.service_rating,
        ambiance_rating=review.ambiance_rating,
        overall_rating=review.overall_rating,
        visit_date=review.visit_date,
        images=review.images,
        likes_count=len(review.likes),
        is_liked_by_user=is_liked,
        created_at=review.created_at,
        dish_reviews=dish_reviews,
        comments=comments
    )

@router.get("/restaurant/{restaurant_id}", response_model=List[ReviewOut])
def get_restaurant_reviews(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    reviews = (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(desc(Review.created_at))
        .all()
    )
    user_id = current_user.id if current_user else None
    return [build_review_out(r, user_id) for r in reviews]

@router.get("/recent", response_model=List[ReviewOut])
def get_recent_reviews(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    reviews = db.query(Review).order_by(desc(Review.created_at)).limit(limit).all()
    user_id = current_user.id if current_user else None
    return [build_review_out(r, user_id) for r in reviews]

@router.get("/user/{user_id}", response_model=List[ReviewOut])
def get_user_reviews(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    reviews = (
        db.query(Review)
        .filter(Review.user_id == user_id)
        .order_by(desc(Review.created_at))
        .all()
    )
    c_user_id = current_user.id if current_user else None
    return [build_review_out(r, c_user_id) for r in reviews]

@router.get("/{review_id}", response_model=ReviewOut)
def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    user_id = current_user.id if current_user else None
    return build_review_out(review, user_id)

@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == review_in.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found")

    review = Review(
        restaurant_id=review_in.restaurant_id,
        user_id=current_user.id,
        title=review_in.title,
        content=review_in.content,
        food_rating=review_in.food_rating,
        price_rating=review_in.price_rating,
        service_rating=review_in.service_rating,
        ambiance_rating=review_in.ambiance_rating,
        overall_rating=review_in.overall_rating,
        visit_date=review_in.visit_date,
        images=review_in.images,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Add dish reviews (food comments)
    if review_in.dish_reviews:
        for dr in review_in.dish_reviews:
            dish_review = DishReview(
                review_id=review.id,
                dish_name=dr.dish_name,
                menu_item_id=dr.menu_item_id,
                sentiment=dr.sentiment or "recommended",
                rating=dr.rating,
                comment=dr.comment,
                price_paid=dr.price_paid
            )
            db.add(dish_review)
        db.commit()
        db.refresh(review)

    return build_review_out(review, current_user.id)

@router.put("/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int,
    review_update: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this review")

    for field, val in review_update.model_dump(exclude_unset=True).items():
        setattr(review, field, val)

    db.commit()
    db.refresh(review)
    return build_review_out(review, current_user.id)

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    if review.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this review")

    db.delete(review)
    db.commit()
    return None

@router.post("/{review_id}/like")
def toggle_review_like(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    existing_like = db.query(ReviewLike).filter(
        ReviewLike.review_id == review_id,
        ReviewLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()
        liked = False
    else:
        new_like = ReviewLike(review_id=review_id, user_id=current_user.id)
        db.add(new_like)
        db.commit()
        liked = True

    total_likes = db.query(ReviewLike).filter(ReviewLike.review_id == review_id).count()
    return {"liked": liked, "likes_count": total_likes}

@router.post("/{review_id}/comments", response_model=ReviewCommentOut)
def add_review_comment(
    review_id: int,
    comment_in: ReviewCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    # Check if commenter is restaurant owner
    is_owner = review.restaurant.owner_id == current_user.id

    comment = ReviewComment(
        review_id=review_id,
        user_id=current_user.id,
        content=comment_in.content,
        is_owner_response=is_owner
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return ReviewCommentOut(
        id=comment.id,
        review_id=comment.review_id,
        user_id=comment.user_id,
        user=UserOut.model_validate(current_user),
        content=comment.content,
        is_owner_response=comment.is_owner_response,
        created_at=comment.created_at
    )

@router.put("/comments/{comment_id}", response_model=ReviewCommentOut)
def update_review_comment(
    comment_id: int,
    comment_update: ReviewCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(ReviewComment).filter(ReviewComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reply not found")

    if comment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this reply")

    comment.content = comment_update.content.strip()
    db.commit()
    db.refresh(comment)

    return ReviewCommentOut(
        id=comment.id,
        review_id=comment.review_id,
        user_id=comment.user_id,
        user=UserOut.model_validate(comment.user) if comment.user else None,
        content=comment.content,
        is_owner_response=comment.is_owner_response,
        created_at=comment.created_at
    )

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    comment = db.query(ReviewComment).filter(ReviewComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reply not found")

    is_comment_author = comment.user_id == current_user.id
    is_review_author = comment.review and comment.review.user_id == current_user.id
    is_admin = current_user.role == "admin"

    if not (is_comment_author or is_review_author or is_admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this reply")

    db.delete(comment)
    db.commit()
    return None

# Get all comments/replies written by a specific user (across all reviews/restaurants)
@router.get("/comments/user/{user_id}", response_model=List[ReviewCommentWithContextOut])
def get_user_comments(
    user_id: str,
    db: Session = Depends(get_db)
):
    comments = db.query(ReviewComment).join(Review).filter(ReviewComment.user_id == user_id).order_by(desc(ReviewComment.created_at)).all()
    results = []
    for c in comments:
        review_title = c.review.title if c.review else "Review"
        restaurant_id = c.review.restaurant_id if c.review else 0
        restaurant_name = c.review.restaurant.name if (c.review and c.review.restaurant) else "Restaurant"
        results.append(
            ReviewCommentWithContextOut(
                id=c.id,
                review_id=c.review_id,
                review_title=review_title,
                restaurant_id=restaurant_id,
                restaurant_name=restaurant_name,
                user_id=c.user_id,
                content=c.content,
                is_owner_response=c.is_owner_response,
                created_at=c.created_at
            )
        )
    return results


