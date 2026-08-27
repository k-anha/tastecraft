# 🍽️ TasteCraft — Multi-Criteria Restaurant & Food Review Platform

TasteCraft is a modern full-stack web application designed for food enthusiasts and restaurant owners. It moves beyond generic 1-to-5 star reviews by offering **multi-criteria ratings (Food Quality, Value & Prices, Service, Ambiance)**, **dish-specific tasting commentary**, and community discussions.

---

## 🚀 Tech Stack

- **Backend**: Python 3.14 + **FastAPI**
- **Database & ORM**: **PostgreSQL** / SQLite + **SQLAlchemy 2.0**
- **Authentication**: JWT (JSON Web Tokens) with `bcrypt` password hashing
- **Frontend**: **React 18** (Vite) + **Tailwind CSS** + **Lucide Icons** + **React Router v6**

---

## ✨ Key Features

1. **Multi-Criteria Rating Breakdown**:
   - 🍲 **Food Quality** (1.0 - 5.0)
   - 💰 **Value & Price** (1.0 - 5.0)
   - 🛎️ **Service Quality** (1.0 - 5.0)
   - ✨ **Atmosphere & Ambiance** (1.0 - 5.0)
   - ⭐ **Overall Community Verdict** (Aggregated dynamically)
2. **Dish-Specific Reviews & Tasting Comments**:
   - Reviewers can tag specific dishes (e.g. *Truffle Tagliolini*, *Black Garlic Tonkotsu Ramen*, *Quesabirria Tacos*).
   - Rate sentiment (*Loved it / Recommended*, *Average*, *Disliked*) and record prices paid.
3. **Restaurant Discovery & Exploration**:
   - Filter by cuisine type (*Italian, Japanese, Indian, Mexican, BBQ, French, Vegan, Cafe*).
   - Filter by price tier (`$` to `$$$$`), minimum score, and city.
   - Sort by highest rated, most reviewed, newest, and price.
4. **Interactive Restaurant Profiles & Digital Menus**:
   - High-resolution cover photo, opening hours, contact details, features (e.g. Outdoor Seating, Halal, Vegan Options).
   - Interactive menu with category tabs and signature dish badges.
5. **Community Engagement & Discussion**:
   - Helpful / Like votes on reviews.
   - Discussion reply threads (including verified **Restaurant Owner Responses**).
   - Bookmark / Save restaurants to user profile.
6. **Authentication & Profile Management**:
   - User registration and login.
   - Profile management with written reviews list and saved favorites.
   - Built-in 1-click Demo Accounts for instant testing.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup (FastAPI + PostgreSQL / SQLite)

```bash
# Navigate to project root
cd "review restaurants"

# Activate the virtual environment
.\venv\Scripts\Activate.ps1   # On Windows PowerShell
# source venv/bin/activate    # On Linux/macOS

# Seed the database with realistic restaurants, menus, and reviews
python backend/app/seed.py

# Run the FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```

> **API Documentation (Swagger UI)** will be live at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

#### Configuring PostgreSQL:
By default, TasteCraft starts instantly using `sqlite:///./tastecraft.db`. To connect to a PostgreSQL instance:
1. Create a database (e.g., `tastecraft_db`).
2. Set the `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/tastecraft_db"
   ```
3. Run `python backend/app/seed.py` to seed tables and sample data.

---

### 3. Frontend Setup (React + Vite)

```bash
cd frontend

# Start the Vite development server
npm run dev
```

> **Frontend Web App** will be running at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing the API

Run the automated backend test suite:

```bash
python backend/test_api.py
```

---

## 👥 Demo Accounts

| Role | Username | Email | Password |
| :--- | :--- | :--- | :--- |
| **Food Reviewer** | `foodie_alex` | `demo@tastecraft.com` | `password123` |
| **Restaurant Owner** | `chef_mario` | `chef_mario@osteriabv.com` | `password123` |
| **Food Critic** | `david_gourmet` | `david.critique@lifestyle.com` | `password123` |

