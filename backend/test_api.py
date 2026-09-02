import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api():
    print("Testing Root & Health endpoints...")
    res = client.get("/")
    assert res.status_code == 200, res.text
    print("Root response:", res.json())

    print("\n1. Testing User Registration with Gender, Country Code & Clean Phone Number...")
    reg_payload = {
        "email": "test_gourmet_female@tastecraft.com",
        "username": "gourmet_female_chef",
        "gender": "Female",
        "country": "India",
        "country_code": "+91",
        "phone_number": "9988776611",
        "password": "password123",
        "full_name": "Gourmet Female Chef",
        "role": "user",
        "accepts_promotions": True
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    if res.status_code == 400:
        print("User already registered, proceeding to tests...")
    else:
        assert res.status_code == 201, res.text
        data = res.json()
        print(f"Registered User: {data['user']['username']} | Gender: {data['user']['gender']} | CC: {data['user']['country_code']}")
        assert data['user']['gender'] == "Female"
        assert data['user']['country_code'] == "+91"

    print("\n2. Testing Mode 2: Login via Mobile Number (foodie_alex)...")
    res = client.post("/api/v1/auth/login", json={
        "country_code": "+1",
        "phone_number": "2065550143",
        "password": "password123"
    })
    assert res.status_code == 200, res.text
    alex_data = res.json()
    alex_id = alex_data["user"]["id"]
    alex_token = alex_data["access_token"]
    alex_headers = {"Authorization": f"Bearer {alex_token}"}
    print(f"Logged in as Alex: {alex_data['user']['username']} (ID: {alex_id})")

    print("\n3. Testing Owner Login (chef_mario)...")
    res = client.post("/api/v1/auth/login", json={
        "email_or_username": "chef_mario",
        "password": "password123"
    })
    assert res.status_code == 200, res.text
    owner_data = res.json()
    owner_token = owner_data["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    print(f"Logged in as Owner: {owner_data['user']['username']} | Role: {owner_data['user']['role']}")

    print("\n4. Testing Restaurant Creation Permission Check (Regular User vs Owner)...")
    # Regular user attempt -> Expect 403 Forbidden
    fail_res = client.post("/api/v1/restaurants", json={
        "name": "Unauthorized Eatery",
        "description": "Should fail",
        "cuisine_type": "Italian",
        "address": "123 Street",
        "city": "Seattle"
    }, headers=alex_headers)
    assert fail_res.status_code == 403, f"Expected 403 Forbidden, got {fail_res.status_code}"
    print("Regular user correctly blocked from creating restaurant with 403 Forbidden!")

    # Owner attempt -> Expect 201 Created
    owner_rest_res = client.post("/api/v1/restaurants", json={
        "name": "Mario's Tuscan Secret",
        "description": "Family-run trattoria with handmade gnocchi and wood-fired focaccia.",
        "cuisine_type": "Italian",
        "price_range": 3,
        "address": "742 Evergreen Terrace",
        "city": "Seattle",
        "state": "WA",
        "features": "Outdoor Seating, Craft Cocktail Bar"
    }, headers=owner_headers)
    assert owner_rest_res.status_code == 201, owner_rest_res.text
    created_restaurant = owner_rest_res.json()
    print(f"Owner successfully created restaurant ID {created_restaurant['id']}: '{created_restaurant['name']}'")

    print("\n5. Testing Dish Upload by Regular User (Alex)...")
    dish_res = client.post(f"/api/v1/restaurants/{created_restaurant['id']}/menu", json={
        "name": "Gorgonzola Truffle Gnocchi",
        "category": "Mains",
        "price": 24.5,
        "description": "Melt-in-your-mouth potato gnocchi in a creamy aged gorgonzola dolce sauce.",
        "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80",
        "is_signature": True
    }, headers=alex_headers)
    assert dish_res.status_code == 201, dish_res.text
    uploaded_dish = dish_res.json()
    assert uploaded_dish["user_id"] == alex_id
    print(f"Alex successfully uploaded dish ID {uploaded_dish['id']}: '{uploaded_dish['name']}' with user_id={uploaded_dish['user_id']}")

    print("\n6. Testing Fetch User Uploaded Dishes (/api/v1/restaurants/menu/user/{user_id})...")
    user_dishes_res = client.get(f"/api/v1/restaurants/menu/user/{alex_id}")
    assert user_dishes_res.status_code == 200
    user_dishes = user_dishes_res.json()
    assert len(user_dishes) >= 1
    assert any(d["id"] == uploaded_dish["id"] for d in user_dishes)
    print(f"Found {len(user_dishes)} dishes uploaded by Alex! (Restaurant: '{user_dishes[0]['restaurant_name']}')")

    print("\n7. Testing User Editing Their Uploaded Dish...")
    edit_dish_res = client.put(f"/api/v1/restaurants/{created_restaurant['id']}/menu/{uploaded_dish['id']}", json={
        "name": "Gorgonzola Truffle Gnocchi (Corrected Portion)",
        "price": 22.0,
        "description": "Fixed typo: includes authentic shaved Parmigiano."
    }, headers=alex_headers)
    assert edit_dish_res.status_code == 200, edit_dish_res.text
    updated_dish = edit_dish_res.json()
    assert updated_dish["name"] == "Gorgonzola Truffle Gnocchi (Corrected Portion)"
    assert updated_dish["price"] == 22.0
    print(f"Alex successfully edited the dish they uploaded: '{updated_dish['name']}' ($22.0)")

    print("\n8. Testing Create, Edit, and Delete Review with Replies...")
    # Create review
    rev_res = client.post("/api/v1/reviews", json={
        "restaurant_id": created_restaurant["id"],
        "title": "Unforgettable handmade gnocchi!",
        "content": "The sauce was heavenly. Will definitely be returning with friends!",
        "food_rating": 4.9,
        "price_rating": 4.5,
        "service_rating": 4.8,
        "ambiance_rating": 4.7,
        "overall_rating": 4.7,
        "visit_date": "2026-08-30"
    }, headers=alex_headers)
    assert rev_res.status_code == 201, rev_res.text
    review_obj = rev_res.json()
    print(f"Review created with ID {review_obj['id']}")

    # Alex posts a reply
    comment_res = client.post(f"/api/v1/reviews/{review_obj['id']}/comments", json={
        "content": "Make sure to request a table on the patio!"
    }, headers=alex_headers)
    assert comment_res.status_code == 200, comment_res.text
    created_comment = comment_res.json()
    print(f"Reply posted with ID {created_comment['id']}: '{created_comment['content']}'")

    # Fetch all replies posted by user
    user_comments_res = client.get(f"/api/v1/reviews/comments/user/{alex_id}")
    assert user_comments_res.status_code == 200
    user_comments = user_comments_res.json()
    assert len(user_comments) >= 1
    print(f"Found {len(user_comments)} replies posted by Alex! (On Review: '{user_comments[0]['review_title']}', Restaurant: '{user_comments[0]['restaurant_name']}')")

    # Delete comment
    del_comment_res = client.delete(f"/api/v1/reviews/comments/{created_comment['id']}", headers=alex_headers)
    assert del_comment_res.status_code == 204
    print("Alex successfully deleted their reply!")

    # Delete user's uploaded dish
    del_dish_res = client.delete(f"/api/v1/restaurants/{created_restaurant['id']}/menu/{uploaded_dish['id']}", headers=alex_headers)
    assert del_dish_res.status_code == 204
    print("Alex successfully deleted the dish they contributed!")

    # Clean up review & restaurant
    client.delete(f"/api/v1/reviews/{review_obj['id']}", headers=alex_headers)
    client.delete(f"/api/v1/restaurants/{created_restaurant['id']}", headers=owner_headers)
    print("Test cleanup complete.")

    print("\nAll User Contributed Dish Editing, Reply Tracking, and Permission Tests Passed 100%!")

if __name__ == "__main__":
    test_api()
