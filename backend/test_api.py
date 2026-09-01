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

    print("\nTesting User Registration with Country Code & Clean Phone Number...")
    reg_payload = {
        "email": "test_gourmet@tastecraft.com",
        "username": "gourmet_chef_test",
        "country": "India",
        "country_code": "+91",
        "phone_number": "9988776655",
        "password": "password123",
        "full_name": "Gourmet Test User",
        "accepts_promotions": True
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    if res.status_code == 400:
        print("User already registered, proceeding to tests...")
    else:
        assert res.status_code == 201, res.text
        data = res.json()
        print(f"Registered User ID: {data['user']['id']}")
        print(f"Country: {data['user']['country']} | Code: {data['user']['country_code']} | Phone: {data['user']['phone_number']}")
        assert data['user']['country'] == "India"
        assert data['user']['country_code'] == "+91"
        assert data['user']['phone_number'] == "9988776655"
    print("\nTesting User Registration with Invalid Email ('demo@yahoo.com2')...")
    invalid_email_res = client.post("/api/v1/auth/register", json={
        "email": "demo@yahoo.com2",
        "username": "invalid_email_user",
        "country": "India",
        "country_code": "+91",
        "phone_number": "9988776654",
        "password": "password123"
    })
    assert invalid_email_res.status_code == 422, invalid_email_res.text
    err_json = invalid_email_res.json()
    print("Invalid Email 422 Response:", err_json)
    assert isinstance(err_json["detail"], str), "Detail must be a clean human-readable string"
    assert "email" in err_json["detail"].lower()
    print("Validation error handled gracefully with clean string detail!")

    print("\nTesting Mode 2: Login via Mobile Number & Country Code (Clean Digits)...")
    res = client.post("/api/v1/auth/login", json={
        "country_code": "+1",
        "phone_number": "2065550143",
        "password": "password123"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    token = data["access_token"]
    print(f"Logged in via Mobile Mode! User: {data['user']['username']} | CC: {data['user']['country_code']} | Phone: {data['user']['phone_number']}")
    assert data['user']['phone_number'] == "2065550143"

    print("\nTesting Mode 1: Login via Username...")
    res = client.post("/api/v1/auth/login", json={
        "email_or_username": "foodie_alex",
        "password": "password123"
    })
    assert res.status_code == 200, res.text
    print("Logged in via Mode 1 (Username) successfully!")

    headers = {"Authorization": f"Bearer {token}"}

    print("\nTesting Current User Profile (/auth/me)...")
    res = client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 200
    user_info = res.json()
    print("Current User:", user_info["full_name"], "| ID:", user_info["id"], "| Phone:", user_info["country_code"], user_info["phone_number"])

    print("\nTesting Get Restaurants with Stats...")
    res = client.get("/api/v1/restaurants", headers=headers)
    assert res.status_code == 200
    restaurants = res.json()
    print(f"Found {len(restaurants)} restaurants.")
    first = restaurants[0]
    print(f"First Restaurant: {first['name']} | Cuisine: {first['cuisine_type']} | Food Rating: {first['stats']['avg_food_rating']} | Bookmarked: {first['is_bookmarked']}")

    print("\nTesting Restaurant Detail with Menu...")
    res = client.get(f"/api/v1/restaurants/{first['id']}", headers=headers)
    assert res.status_code == 200
    detail = res.json()
    print(f"Restaurant {detail['name']} has {len(detail['menu_items'])} menu items.")

    print("\nTesting Create New Review with Multi-Criteria & Dish Comments...")
    new_review_payload = {
        "restaurant_id": first["id"],
        "title": "Stellar culinary journey!",
        "content": "Truly exceptional dining experience from start to finish. The pasta dough was fresh and tender, service was quick.",
        "food_rating": 4.9,
        "price_rating": 4.5,
        "service_rating": 5.0,
        "ambiance_rating": 4.8,
        "overall_rating": 4.8,
        "visit_date": "2026-08-26",
        "dish_reviews": [
            {
                "dish_name": "Truffle Tagliolini",
                "sentiment": "recommended",
                "rating": 5.0,
                "comment": "Unbelievable depth of flavor, fresh black truffles shaved generously tableside!",
                "price_paid": 28.0
            }
        ]
    }
    res = client.post("/api/v1/reviews", json=new_review_payload, headers=headers)
    assert res.status_code == 201, res.text
    created_review = res.json()
    print(f"Review created successfully with ID {created_review['id']} by reviewer user_id: {created_review['user_id']}")

    print("\nTesting Toggle Like on Review...")
    res = client.post(f"/api/v1/reviews/{created_review['id']}/like", headers=headers)
    assert res.status_code == 200
    print("Like response:", res.json())

    print("\nTesting Add Comment to Review...")
    res = client.post(f"/api/v1/reviews/{created_review['id']}/comments", json={
        "content": "Glad you enjoyed the dish! It's our house specialty."
    }, headers=headers)
    assert res.status_code == 200
    print("Comment added:", res.json()["content"])

    print("\nTesting Bookmarks List...")
    res = client.get("/api/v1/bookmarks", headers=headers)
    assert res.status_code == 200
    print(f"User has {len(res.json())} bookmarked restaurants.")

    print("\nAll Backend API Tests with Dual Login Modes Passed Perfectly!")

if __name__ == "__main__":
    test_api()
