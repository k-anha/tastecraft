import os
import sys
import json

# Add backend directory to sys.path so app imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.restaurant import Restaurant, MenuItem
from app.models.review import Review, DishReview, ReviewComment, ReviewLike
from app.models.bookmark import Bookmark
from app.core.security import get_password_hash

def seed_database():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Restaurant).count() > 0:
            print("Database already contains restaurant data. Skipping full re-seed.")
            return

        print("Seeding users with clean alphanumeric hex IDs, countries, country codes, phone numbers, and promotions preferences...")
        users_data = [
            {
                "id": "a18b9c2d1e4f",
                "email": "demo@tastecraft.com",
                "username": "foodie_alex",
                "gender": "Male",
                "country": "America",
                "country_code": "+1",
                "phone_number": "2065550143",
                "full_name": "Alex Mercer",
                "role": "user",
                "accepts_promotions": True,
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
                "bio": "Culinary enthusiast, coffee snob, and weekend food photographer based in Seattle."
            },
            {
                "id": "b29c0d3e2f5a",
                "email": "chef_mario@osteriabv.com",
                "username": "chef_mario",
                "gender": "Male",
                "country": "America",
                "country_code": "+1",
                "phone_number": "2065550188",
                "full_name": "Chef Mario Rossi",
                "role": "owner",
                "accepts_promotions": True,
                "avatar_url": "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=200&q=80",
                "bio": "Executive Chef and Owner at Osteria Bella Vista. 20 years bringing authentic Tuscan recipes to life."
            },
            {
                "id": "c30d1e4f3a6b",
                "email": "sarah.foodadventures@gmail.com",
                "username": "sarah_eats",
                "gender": "Female",
                "country": "America",
                "country_code": "+1",
                "phone_number": "2065550199",
                "full_name": "Sarah Jenkins",
                "role": "user",
                "accepts_promotions": True,
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
                "bio": "Searching for the world's best noodles, tacos, and desserts."
            },
            {
                "id": "d41e2f5a4b7c",
                "email": "david.critique@lifestyle.com",
                "username": "david_gourmet",
                "gender": "Male",
                "country": "America",
                "country_code": "+1",
                "phone_number": "2065550177",
                "full_name": "David Thorne",
                "role": "user",
                "accepts_promotions": False,
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
                "bio": "Food writer and hospitality reviewer. Quality, value, and ambiance are my guiding stars."
            },
            {
                "id": "e52f3a6b5c8d",
                "email": "priya.spicetrail@yahoo.com",
                "username": "priya_tasting",
                "gender": "Female",
                "country": "India",
                "country_code": "+91",
                "phone_number": "9876543210",
                "full_name": "Priya Patel",
                "role": "user",
                "accepts_promotions": True,
                "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
                "bio": "Lover of bold spices, wood-fired cooking, and craft cocktails."
            }
        ]

        created_users = []
        for u in users_data:
            user = User(
                id=u["id"],
                email=u["email"],
                username=u["username"],
                gender=u.get("gender"),
                country=u["country"],
                country_code=u["country_code"],
                phone_number=u["phone_number"],
                hashed_password=get_password_hash("password123"),
                full_name=u["full_name"],
                role=u["role"],
                accepts_promotions=u["accepts_promotions"],
                avatar_url=u["avatar_url"],
                bio=u["bio"]
            )
            db.add(user)
            created_users.append(user)

        db.commit()
        for u in created_users:
            db.refresh(u)

        print(f"Created {len(created_users)} users.")

        # Restaurants Data
        restaurants_data = [
            {
                "name": "Osteria Bella Vista",
                "description": "Authentic Northern Italian trattoria specializing in handmade pasta, wood-fired meats, and an extensive cellar of Tuscan wines.",
                "cuisine_type": "Italian",
                "price_range": 3,
                "address": "452 Pine Street, Downtown",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98101",
                "phone_number": "(206) 555-0192",
                "website": "https://osteriabellavista.example.com",
                "opening_hours": "Tue-Sun: 5:00 PM - 10:30 PM",
                "image_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
                "features": "Outdoor Seating, Romantic Ambiance, Extensive Wine List, Reservations Recommended, Valet Parking",
                "owner_id": created_users[1].id,
                "menu": [
                    {"name": "Truffle Tagliolini", "category": "Mains", "price": 28.0, "description": "Handmade egg pasta with shaved black winter truffles, cultured butter, and 24-month Parmigiano Reggiano.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600&q=80"},
                    {"name": "Burrata Pugliese", "category": "Appetizers", "price": 18.0, "description": "Fresh creamy burrata, heirloom roasted tomatoes, basil oil, and grilled sourdough.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1592417817098-8f3d6ef2c481?w=600&q=80"},
                    {"name": "Bistecca alla Fiorentina", "category": "Mains", "price": 54.0, "description": "Oak-grilled 20oz prime T-bone steak with rosemary sea salt and rosemary oil.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80"},
                    {"name": "Classic Tiramisu", "category": "Desserts", "price": 12.0, "description": "Espresso-soaked ladyfingers, mascarpone cream, and Valrhona cocoa powder.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80"}
                ]
            },
            {
                "name": "Sakura Ramen & Izakaya",
                "description": "Artisan 18-hour simmered Tonkotsu broth, house-pulled noodles, and smoky charcoal robata skewers in a cozy neon-lit izakaya atmosphere.",
                "cuisine_type": "Japanese",
                "price_range": 2,
                "address": "1208 E Pike St, Capitol Hill",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98122",
                "phone_number": "(206) 555-8392",
                "website": "https://sakuraramen.example.com",
                "opening_hours": "Mon-Sun: 11:30 AM - 11:00 PM",
                "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1552611052-33e04de081de?w=1200&q=80",
                "features": "Casual Dining, Craft Japanese Beer, Late Night, Fast Service, Vegetarian Broth Option",
                "owner_id": created_users[1].id,
                "menu": [
                    {"name": "Black Garlic Tonkotsu Ramen", "category": "Mains", "price": 17.5, "description": "Rich pork broth, charred mayu garlic oil, chashu pork belly, ajitama egg, and wood ear mushrooms.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80"},
                    {"name": "Wagyu Beef Bao Buns", "category": "Appetizers", "price": 14.0, "description": "Steamed lotus buns with braised wagyu short rib, pickled cucumbers, and hoisin drizzle.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&q=80"},
                    {"name": "Crispy Pork Gyoza", "category": "Appetizers", "price": 9.5, "description": "Pan-fried dumplings with juicy pork filling and chili scallion dipping sauce.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80"},
                    {"name": "Matcha Crepe Cake", "category": "Desserts", "price": 10.0, "description": "Mille-feuille with Uji matcha infused cream layers and red bean coulis.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&q=80"}
                ]
            },
            {
                "name": "Tandoori Nights & Spice Lounge",
                "description": "Vibrant and authentic North & South Indian fine dining with clay oven tandoori delicacies, rich curries, and house-blended spices.",
                "cuisine_type": "Indian",
                "price_range": 2,
                "address": "814 1st Avenue, Belltown",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98104",
                "phone_number": "(206) 555-4491",
                "website": "https://tandoorinights.example.com",
                "opening_hours": "Tue-Sun: 12:00 PM - 10:00 PM",
                "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
                "features": "Halal Certified, Vegan Friendly, Buffet Lunch, Full Cocktail Bar, Family Friendly",
                "owner_id": None,
                "menu": [
                    {"name": "Smoked Butter Chicken", "category": "Mains", "price": 21.0, "description": "Tandoor roasted chicken in velvety tomato makhani sauce infused with fenugreek and butter.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80"},
                    {"name": "Hyderabadi Lamb Dum Biryani", "category": "Mains", "price": 24.0, "description": "Aromatic basmati rice layered with tender spiced lamb, saffron, and fried onions, served with cucumber raita.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80"},
                    {"name": "Garlic & Truffle Naan", "category": "Appetizers", "price": 6.5, "description": "Clay-oven baked bread with fresh garlic, cilantro, and white truffle butter glaze.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&q=80"},
                    {"name": "Pistachio Kulfi", "category": "Desserts", "price": 8.0, "description": "Traditional Indian ice cream flavored with cardamom, saffron, and roasted pistachios.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80"}
                ]
            },
            {
                "name": "La Taqueria del Sol",
                "description": "Street-style Mexico City tacos, hand-pressed blue corn tortillas, crispy carnitas, slow-cooked birria, and mezcal pairings.",
                "cuisine_type": "Mexican",
                "price_range": 1,
                "address": "2204 NW Market St, Ballard",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98107",
                "phone_number": "(206) 555-7312",
                "website": "https://taqueriadelsol.example.com",
                "opening_hours": "Mon-Sun: 11:00 AM - 10:00 PM",
                "image_url": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
                "features": "Patio Seating, Craft Margaritas, Gluten-Free Friendly, Great Value, Fast Casual",
                "owner_id": None,
                "menu": [
                    {"name": "Quesabirria Tacos with Consomé", "category": "Mains", "price": 16.0, "description": "Three crispy griddled corn tortillas filled with tender braised beef and melted Oaxaca cheese, served with rich consomé dipping broth.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80"},
                    {"name": "Charred Guacamole & Totopos", "category": "Appetizers", "price": 10.0, "description": "Hass avocados, charred jalapeños, lime, cotija cheese, and fresh fried tortilla chips.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80"},
                    {"name": "Al Pastor Taco Trio", "category": "Mains", "price": 14.0, "description": "Achiote marinated spit-roasted pork with grilled pineapple, onions, and salsa verde.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80"},
                    {"name": "Cinnamon Churros con Chocolate", "category": "Desserts", "price": 8.0, "description": "Crispy golden churros dusted with canela sugar, served with spicy Mexican dark chocolate dip.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=600&q=80"}
                ]
            },
            {
                "name": "Smokey Ridge BBQ Pit",
                "description": "Texas-style slow oak-smoked brisket, fall-off-the-bone ribs, and homestyle southern sides in an open-air rustic setting.",
                "cuisine_type": "American BBQ",
                "price_range": 2,
                "address": "1510 S Jackson St, Central District",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98144",
                "phone_number": "(206) 555-9081",
                "website": "https://smokeyridgebbq.example.com",
                "opening_hours": "Wed-Sun: 11:30 AM until Sold Out",
                "image_url": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
                "features": "Casual, Outdoor Picnic Benches, Craft Beer on Tap, Takeout Friendly, Huge Portions",
                "owner_id": None,
                "menu": [
                    {"name": "Prime Smoked Brisket Platter", "category": "Mains", "price": 26.0, "description": "1/2 lb of 16-hour post-oak smoked brisket with peppery bark, pickles, onions, and choice of 2 sides.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80"},
                    {"name": "Three-Cheese Truffle Mac", "category": "Appetizers", "price": 9.0, "description": "Cavatappi pasta baked with aged cheddar, gouda, and gruyère topped with crispy cornbread crumbs.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&q=80"},
                    {"name": "St. Louis Cut Ribs", "category": "Mains", "price": 24.0, "description": "Half rack of dry-rubbed smoked pork ribs with sweet and tangy house BBQ sauce.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80"},
                    {"name": "Skillet Peach Cobbler", "category": "Desserts", "price": 8.5, "description": "Warm caramelized Georgia peaches with butter biscuit crust and vanilla bean ice cream.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=600&q=80"}
                ]
            },
            {
                "name": "L'Étoile French Bistro",
                "description": "Intimate Parisian bistro bringing timeless French classics, seasonal market produce, and exceptional craft wine pairings.",
                "cuisine_type": "French",
                "price_range": 4,
                "address": "701 4th Ave, Financial District",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98104",
                "phone_number": "(206) 555-3209",
                "website": "https://letoilebistro.example.com",
                "opening_hours": "Tue-Sat: 5:30 PM - 11:00 PM",
                "image_url": "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
                "features": "Fine Dining, Sommelier Service, Romantic, Tasting Menu Available, Full Bar",
                "owner_id": None,
                "menu": [
                    {"name": "Crispy Duck Confit", "category": "Mains", "price": 38.0, "description": "Slow-cured moulard duck leg with sarladaise potatoes, braised red cabbage, and cherry port reduction.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1514944298350-482d77d7042a?w=600&q=80"},
                    {"name": "Gratinée French Onion Soup", "category": "Appetizers", "price": 16.0, "description": "Caramelized sweet onions in rich beef bone broth, topped with sourdough crouton and melted Gruyère.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80"},
                    {"name": "Tahitian Vanilla Crème Brûlée", "category": "Desserts", "price": 14.0, "description": "Silky baked custard with caramelized sugar crust and fresh berries.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600&q=80"}
                ]
            },
            {
                "name": "Green Garden Plant Kitchen",
                "description": "100% plant-based organic eatery crafting innovative comfort foods, superfood bowls, cold-pressed juices, and vegan desserts.",
                "cuisine_type": "Vegan / Healthy",
                "price_range": 2,
                "address": "1809 Westlake Ave, South Lake Union",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98109",
                "phone_number": "(206) 555-6677",
                "website": "https://greengardenplant.example.com",
                "opening_hours": "Mon-Sat: 8:00 AM - 8:00 PM",
                "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80",
                "features": "100% Vegan, Gluten-Free Options, Organic Ingredients, Eco-Friendly, Dog Friendly Patio",
                "owner_id": None,
                "menu": [
                    {"name": "Truffle Wild Mushroom Burger", "category": "Mains", "price": 18.0, "description": "House lentil & walnut patty, caramelized onions, sautéed wild chanterelles, cashew truffle aioli, on brioche bun.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80"},
                    {"name": "Dragonfruit Acai Bowl", "category": "Appetizers", "price": 13.5, "description": "Organic pitaya and acai blend topped with hemp granola, fresh berries, chia seeds, and coconut flakes.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80"},
                    {"name": "Raw Vegan Salted Caramel Tart", "category": "Desserts", "price": 9.5, "description": "Almond pecan crust, date caramel filling, dark chocolate ganache, and Maldon sea salt flakes.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80"}
                ]
            },
            {
                "name": "The Artisan Roastery & Cafe",
                "description": "Specialty coffee roastery with single-origin pour-overs, handcrafted matcha, artisanal sourdough sandwiches, and freshly baked pastries.",
                "cuisine_type": "Cafe & Bakery",
                "price_range": 1,
                "address": "620 Fremont Ave N, Fremont",
                "city": "Seattle",
                "state": "WA",
                "zip_code": "98103",
                "phone_number": "(206) 555-1940",
                "website": "https://artisanroastery.example.com",
                "opening_hours": "Mon-Sun: 7:00 AM - 6:00 PM",
                "image_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
                "cover_image_url": "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=80",
                "features": "Free High-Speed WiFi, Outdoor Seating, Pastries Baked Daily, Oat/Almond Milk, Laptop Friendly",
                "owner_id": None,
                "menu": [
                    {"name": "Heirloom Avocado Sourdough Toast", "category": "Mains", "price": 12.5, "description": "Toasted house levain, mashed avocado, poached egg, pickled shallots, dukkah spice, and microgreens.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80"},
                    {"name": "Ceremonial Iced Matcha Latte", "category": "Drinks", "price": 6.5, "description": "Single-estate Kyoto matcha whisked fresh with organic oat milk and vanilla bean syrup.", "is_signature": True, "image_url": "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&q=80"},
                    {"name": "Cardamom Almond Croissant", "category": "Desserts", "price": 5.5, "description": "Flaky butter croissant stuffed with cardamom frangipane cream and toasted sliced almonds.", "is_signature": False, "image_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80"}
                ]
            }
        ]

        created_restaurants = []
        for r_data in restaurants_data:
            menu_data = r_data.pop("menu")
            restaurant = Restaurant(**r_data)
            db.add(restaurant)
            db.commit()
            db.refresh(restaurant)

            for m in menu_data:
                item = MenuItem(restaurant_id=restaurant.id, **m)
                db.add(item)

            db.commit()
            created_restaurants.append(restaurant)

        print(f"Created {len(created_restaurants)} restaurants with full menus.")

        # Seed Multi-Criteria Reviews & Food Comments
        reviews_data = [
            {
                "restaurant": created_restaurants[0], # Osteria Bella Vista
                "user": created_users[0], # Alex Mercer
                "title": "Unforgettable Anniversary Dinner - The Truffle Tagliolini is heavenly!",
                "content": "We had high expectations coming here for our anniversary and Osteria Bella Vista exceeded every single one. The ambiance is warm, candlelit, and romantic. The wine pairing recommendation from the sommelier was spot on. Every bite of pasta felt like a trip to Florence.",
                "food_rating": 5.0,
                "price_rating": 4.5,
                "service_rating": 5.0,
                "ambiance_rating": 5.0,
                "overall_rating": 4.9,
                "visit_date": "2026-08-15",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600&q=80",
                    "https://images.unsplash.com/photo-1592417817098-8f3d6ef2c481?w=600&q=80"
                ]),
                "dish_reviews": [
                    {
                        "dish_name": "Truffle Tagliolini",
                        "sentiment": "recommended",
                        "rating": 5.0,
                        "comment": "Extremely silky texture, and the fresh shaved black truffles gave it an intoxicating aroma. Best pasta I have eaten this year.",
                        "price_paid": 28.0
                    },
                    {
                        "dish_name": "Burrata Pugliese",
                        "sentiment": "recommended",
                        "rating": 4.8,
                        "comment": "Super fresh center, paired delightfully with sweet roasted heirloom tomatoes and warm crusty bread.",
                        "price_paid": 18.0
                    }
                ],
                "comments": [
                    {
                        "user": created_users[1], # Chef Mario (Owner)
                        "content": "Thank you so much Alex! We are delighted that you chose us for your anniversary. The black truffles arrived fresh from Umbria that very week. Looking forward to welcoming you back soon!",
                        "is_owner_response": True
                    }
                ]
            },
            {
                "restaurant": created_restaurants[0], # Osteria Bella Vista
                "user": created_users[3], # David Thorne
                "title": "Exquisite culinary technique and stellar wine cellar",
                "content": "A high-end Italian experience done right. The Bistecca is cooked over genuine oak wood giving it a magnificent crust while preserving the tender interior. Service is attentive without feeling intrusive.",
                "food_rating": 4.8,
                "price_rating": 4.0,
                "service_rating": 4.9,
                "ambiance_rating": 4.7,
                "overall_rating": 4.6,
                "visit_date": "2026-08-10",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80"
                ]),
                "dish_reviews": [
                    {
                        "dish_name": "Bistecca alla Fiorentina",
                        "sentiment": "recommended",
                        "rating": 4.9,
                        "comment": "Magnificent sear and perfect medium rare. The rosemary olive oil finish is authentic Tuscan style.",
                        "price_paid": 54.0
                    },
                    {
                        "dish_name": "Classic Tiramisu",
                        "sentiment": "recommended",
                        "rating": 4.5,
                        "comment": "Light and airy cream, not overly sweetened. Perfect espresso kick.",
                        "price_paid": 12.0
                    }
                ],
                "comments": []
            },
            {
                "restaurant": created_restaurants[1], # Sakura Ramen
                "user": created_users[2], # Sarah Jenkins
                "title": "Craving-worthy Tonkotsu with phenomenal deep broth!",
                "content": "If you love rich, complex ramen broths with deep umami, Sakura Ramen is a must-visit in Capitol Hill. The line can get long on Friday nights, but the kitchen works fast and the food is so worth the wait.",
                "food_rating": 4.9,
                "price_rating": 4.7,
                "service_rating": 4.2,
                "ambiance_rating": 4.5,
                "overall_rating": 4.6,
                "visit_date": "2026-08-20",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
                    "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&q=80"
                ]),
                "dish_reviews": [
                    {
                        "dish_name": "Black Garlic Tonkotsu Ramen",
                        "sentiment": "recommended",
                        "rating": 5.0,
                        "comment": "The black garlic oil elevates the 18hr broth to another level. Noodles have that ideal chewy bite (katame).",
                        "price_paid": 17.5
                    },
                    {
                        "dish_name": "Wagyu Beef Bao Buns",
                        "sentiment": "recommended",
                        "rating": 4.7,
                        "comment": "Pillowy buns, juicy braised short rib that melts in your mouth with a nice crunch from pickled cucumber.",
                        "price_paid": 14.0
                    }
                ],
                "comments": [
                    {
                        "user": created_users[0],
                        "content": "Totally agree Sarah! Their black garlic ramen is my go-to comfort food on rainy days.",
                        "is_owner_response": False
                    }
                ]
            },
            {
                "restaurant": created_restaurants[2], # Tandoori Nights
                "user": created_users[4], # Priya Patel
                "title": "Authentic aromas, rich gravies and the best Dum Biryani in town",
                "content": "Coming from a family that loves traditional Indian cooking, I am very picky with Butter Chicken and Biryani. Tandoori Nights delivers genuine depth of spices without taking shortcuts. The garlic naan straight out of the clay tandoor was divine.",
                "food_rating": 4.8,
                "price_rating": 4.5,
                "service_rating": 4.6,
                "ambiance_rating": 4.4,
                "overall_rating": 4.6,
                "visit_date": "2026-08-18",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80"
                ]),
                "dish_reviews": [
                    {
                        "dish_name": "Smoked Butter Chicken",
                        "sentiment": "recommended",
                        "rating": 4.9,
                        "comment": "Not overly sweet like many restaurants make it. Genuine charcoal smoky aroma and luscious tomato gravy.",
                        "price_paid": 21.0
                    },
                    {
                        "dish_name": "Hyderabadi Lamb Dum Biryani",
                        "sentiment": "recommended",
                        "rating": 4.8,
                        "comment": "Each grain of basmati is separate and infused with saffron and spices. Lamb was fork-tender.",
                        "price_paid": 24.0
                    }
                ],
                "comments": []
            },
            {
                "restaurant": created_restaurants[3], # La Taqueria del Sol
                "user": created_users[0], # Alex Mercer
                "title": "Juicy Quesabirria that sets the standard!",
                "content": "Incredible value and electric atmosphere. Dipping that crispy cheesy quesabirria taco into the piping hot consomé is pure food bliss. Service is fast and friendly.",
                "food_rating": 4.7,
                "price_rating": 5.0,
                "service_rating": 4.4,
                "ambiance_rating": 4.3,
                "overall_rating": 4.6,
                "visit_date": "2026-08-22",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
                    "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=600&q=80"
                ]),
                "dish_reviews": [
                    {
                        "dish_name": "Quesabirria Tacos with Consomé",
                        "sentiment": "recommended",
                        "rating": 5.0,
                        "comment": "Crispy cheese crust on the outside, tender juicy shredded beef inside. 10/10.",
                        "price_paid": 16.0
                    },
                    {
                        "dish_name": "Cinnamon Churros con Chocolate",
                        "sentiment": "recommended",
                        "rating": 4.6,
                        "comment": "Fried fresh to order! Crunchy outside, pillowy inside, rich spicy chocolate dip.",
                        "price_paid": 8.0
                    }
                ],
                "comments": []
            },
            {
                "restaurant": created_restaurants[4], # Smokey Ridge BBQ
                "user": created_users[3], # David Thorne
                "title": "Serious Texas bark on the brisket and decadent mac & cheese",
                "content": "They do BBQ the authentic way with wood smoke and patient low-and-slow technique. The brisket has a deep dark pepper crust and a beautiful pink smoke ring. Arrive before 1 PM on weekends as they sell out fast!",
                "food_rating": 4.9,
                "price_rating": 4.4,
                "service_rating": 4.3,
                "ambiance_rating": 4.1,
                "overall_rating": 4.5,
                "visit_date": "2026-08-14",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80"
                ]),
                "dish_reviews": [
                    {
                        "dish_name": "Prime Smoked Brisket Platter",
                        "sentiment": "recommended",
                        "rating": 5.0,
                        "comment": "Renders down perfectly with moist fatty slices and a peppery crunch on the crust.",
                        "price_paid": 26.0
                    },
                    {
                        "dish_name": "Three-Cheese Truffle Mac",
                        "sentiment": "recommended",
                        "rating": 4.6,
                        "comment": "Super creamy and cheesy with a subtle truffle aroma that pairs surprisingly well with BBQ.",
                        "price_paid": 9.0
                    }
                ],
                "comments": []
            },
            {
                "restaurant": created_restaurants[6], # Green Garden Plant Kitchen
                "user": created_users[2], # Sarah Jenkins
                "title": "Flavor-packed plant-based creations that blow you away!",
                "content": "Even my non-vegan friends were raving about the Truffle Wild Mushroom burger. The patio is surrounded by lush herbs and greenery, making it a peaceful lunch oasis.",
                "food_rating": 4.7,
                "price_rating": 4.2,
                "service_rating": 4.6,
                "ambiance_rating": 4.8,
                "overall_rating": 4.6,
                "visit_date": "2026-08-25",
                "images": json.dumps([
                    "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80"
                ]),
                "dish_reviews": [
                    {
                        "dish_name": "Truffle Wild Mushroom Burger",
                        "sentiment": "recommended",
                        "rating": 4.9,
                        "comment": "Incredible umami flavor, mushrooms are caramelized to perfection with rich cashew truffle aioli.",
                        "price_paid": 18.0
                    }
                ],
                "comments": []
            }
        ]

        for rev in reviews_data:
            dish_revs = rev.pop("dish_reviews", [])
            comm_list = rev.pop("comments", [])
            r_obj = rev.pop("restaurant")
            u_obj = rev.pop("user")

            review = Review(
                restaurant_id=r_obj.id,
                user_id=u_obj.id,
                **rev
            )
            db.add(review)
            db.commit()
            db.refresh(review)

            for dr in dish_revs:
                dish_review = DishReview(review_id=review.id, **dr)
                db.add(dish_review)

            for c in comm_list:
                c_user = c.pop("user")
                comment = ReviewComment(review_id=review.id, user_id=c_user.id, **c)
                db.add(comment)

            # Add sample likes
            like = ReviewLike(review_id=review.id, user_id=created_users[0].id)
            db.add(like)
            db.commit()

        # Seed sample bookmarks
        b1 = Bookmark(user_id=created_users[0].id, restaurant_id=created_restaurants[0].id)
        b2 = Bookmark(user_id=created_users[0].id, restaurant_id=created_restaurants[1].id)
        b3 = Bookmark(user_id=created_users[0].id, restaurant_id=created_restaurants[3].id)
        db.add_all([b1, b2, b3])
        db.commit()

        print("Database seeded successfully with rich realistic restaurants, menus, multi-criteria reviews, and dish comments!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

