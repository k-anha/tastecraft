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

    print("\n2. Testing Mode 2: Login via Mobile Number...")
    res = client.post("/api/v1/auth/login", json={
        "country_code": "+1",
        "phone_number": "2065550143",
        "password": "password123"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    user_token = data["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    print(f"Logged in as User: {data['user']['username']} | Role: {data['user']['role']}")

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
    }, headers=user_headers)
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
    print(f"Owner successfully created restaurant ID {created_restaurant['id']}: '{created_restaurant['name']}' (Phone: {created_restaurant['phone_number']})")

    print("\n4b. Testing Edit Restaurant Details (by Owner)...")
    edit_rest_res = client.put(f"/api/v1/restaurants/{created_restaurant['id']}", json={
        "name": "Mario's Tuscan Secret & Wine Bar",
        "description": "Authentic rustic trattoria updated with artisanal Chianti selections and fresh pastas.",
        "phone_number": "+1 2065559999"
    }, headers=owner_headers)
    assert edit_rest_res.status_code == 200, edit_rest_res.text
    edited_restaurant = edit_rest_res.json()
    assert edited_restaurant["name"] == "Mario's Tuscan Secret & Wine Bar"
    assert edited_restaurant["phone_number"] == "+1 2065559999"
    print(f"Restaurant ID {created_restaurant['id']} successfully edited by owner: '{edited_restaurant['name']}'")

    print("\n5. Testing Dish Upload by ANY User (Food Lover)...")
    dish_res = client.post(f"/api/v1/restaurants/{created_restaurant['id']}/menu", json={
        "name": "Gorgonzola Truffle Gnocchi",
        "category": "Mains",
        "price": 24.5,
        "description": "Melt-in-your-mouth potato gnocchi in a creamy aged gorgonzola dolce sauce.",
        "image_url": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80",
        "is_signature": True
    }, headers=user_headers)
    assert dish_res.status_code == 201, dish_res.text
    uploaded_dish = dish_res.json()
    print(f"Food lover successfully uploaded dish ID {uploaded_dish['id']}: '{uploaded_dish['name']}' (${uploaded_dish['price']})")

    print("\n6. Testing Edit Dish in Menu (by Owner)...")
    edit_dish_res = client.put(f"/api/v1/restaurants/{created_restaurant['id']}/menu/{uploaded_dish['id']}", json={
        "name": "Gorgonzola White Truffle Gnocchi (Chef Special)",
        "price": 28.0,
        "description": "Upgraded with fresh Alba white truffles."
    }, headers=owner_headers)
    assert edit_dish_res.status_code == 200, edit_dish_res.text
    updated_dish = edit_dish_res.json()
    assert updated_dish["name"] == "Gorgonzola White Truffle Gnocchi (Chef Special)"
    assert updated_dish["price"] == 28.0
    print(f"Dish ID {uploaded_dish['id']} successfully edited by owner: '{updated_dish['name']}' (${updated_dish['price']})")

    print("\n7. Testing Create, Edit, and Delete Review...")
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
    }, headers=user_headers)
    assert rev_res.status_code == 201, rev_res.text
    review_obj = rev_res.json()
    print(f"Review created with ID {review_obj['id']}")

    # Edit review
    edit_res = client.put(f"/api/v1/reviews/{review_obj['id']}", json={
        "title": "Unforgettable handmade gnocchi! (Updated)",
        "content": "Updated after a second visit: even better than the first time!",
        "food_rating": 5.0,
        "overall_rating": 4.9
    }, headers=user_headers)
    assert edit_res.status_code == 200, edit_res.text
    updated_review = edit_res.json()
    assert updated_review["title"] == "Unforgettable handmade gnocchi! (Updated)"
    assert updated_review["food_rating"] == 5.0
    print(f"Review ID {review_obj['id']} successfully updated by author!")

    print("\n8. Testing Add, Edit, and Delete Reply / Comment on Review...")
    # Add comment
    comment_res = client.post(f"/api/v1/reviews/{review_obj['id']}/comments", json={
        "content": "Did you try pairing it with the Pinot Grigio?"
    }, headers=user_headers)
    assert comment_res.status_code == 200, comment_res.text
    created_comment = comment_res.json()
    print(f"Reply posted with ID {created_comment['id']}: '{created_comment['content']}'")

    # Edit comment
    edit_comment_res = client.put(f"/api/v1/reviews/comments/{created_comment['id']}", json={
        "content": "Did you try pairing it with the Pinot Grigio? Highly recommended!"
    }, headers=user_headers)
    assert edit_comment_res.status_code == 200, edit_comment_res.text
    updated_comment = edit_comment_res.json()
    assert updated_comment["content"] == "Did you try pairing it with the Pinot Grigio? Highly recommended!"
    print(f"Reply ID {created_comment['id']} successfully edited: '{updated_comment['content']}'")

    # Delete comment
    del_comment_res = client.delete(f"/api/v1/reviews/comments/{created_comment['id']}", headers=user_headers)
    assert del_comment_res.status_code == 204
    print(f"Reply ID {created_comment['id']} successfully deleted!")

    # Delete review
    del_rev_res = client.delete(f"/api/v1/reviews/{review_obj['id']}", headers=user_headers)
    assert del_rev_res.status_code == 204
    print(f"Review ID {review_obj['id']} successfully deleted!")

    print("\n9. Testing Delete Menu Item (by Restaurant Owner)...")
    del_dish_res = client.delete(f"/api/v1/restaurants/{created_restaurant['id']}/menu/{uploaded_dish['id']}", headers=owner_headers)
    assert del_dish_res.status_code == 204
    print(f"Menu item ID {uploaded_dish['id']} successfully deleted by owner!")

    print("\n10. Testing Delete Entire Restaurant (by Restaurant Owner)...")
    del_rest_res = client.delete(f"/api/v1/restaurants/{created_restaurant['id']}", headers=owner_headers)
    assert del_rest_res.status_code == 204
    print(f"Restaurant ID {created_restaurant['id']} successfully deleted by owner!")

    print("\nAll End-to-End Tests for Dish Editing, Reply Editing/Deleting, and Permissions Passed 100%!")

if __name__ == "__main__":
    test_api()
