from fastapi import FastAPI
from pydantic import BaseModel
import random
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
import json
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import secrets

app = FastAPI()

# --------------------------------------------------
#  Basic Auth Setup
# --------------------------------------------------
security = HTTPBasic()

#  Change these in production
APP_USERNAME = os.getenv("APP_USERNAME", "admin")
APP_PASSWORD = os.getenv("APP_PASSWORD", "fitmeal123")


# --------------------------------------------------
# ✅ Enable CORS (frontend can call backend)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_credentials(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(
        credentials.username, APP_USERNAME
    )
    correct_password = secrets.compare_digest(
        credentials.password, APP_PASSWORD
    )

    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username

# --------------------------------------------------
# ✅ File paths
# --------------------------------------------------
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

MEAL_FILE = DATA_DIR / "meals.json"
GROCERIES_FILE = DATA_DIR / "groceries.json"


# --------------------------------------------------
# ✅ Safe JSON helpers (NO MORE CRASHES)
# --------------------------------------------------
def load_json(file_path):
    """Safely load JSON"""
    if not file_path.exists():
        return {}

    try:
        content = file_path.read_text().strip()
        if not content:
            return {}
        return json.loads(content)
    except json.JSONDecodeError:
        print(f"⚠️ Invalid JSON in {file_path}, using empty dict")
        return {}


def save_json(file_path, data):
    """Save JSON permanently"""
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)


# --------------------------------------------------
# ✅ Default data (first run safety)
# --------------------------------------------------
DEFAULT_MEALS = {
    "breakfast": {
        "main": ["Idli", "Dosa", "Pongal"],
        "sidedish": ["Sambar", "Coconut Chutney"],
    },
    "lunch": {
        "main": ["Sambar Rice", "Curd Rice"],
        "second_main": ["Poriyal", "Appalam"],
        "poriyal": ["Beans Poriyal", "Carrot Poriyal"],
    },
    "dinner": {
        "main": ["Chapati", "Dosa"],
        "sidedish": ["Kurma", "Chutney"],
    },
    "snack": {
        "main": ["Sundal", "Vadai"],
        "sidedish": ["Tea", "Coffee"],
    },
}

DEFAULT_GROCERIES = {
    "Vegetables": ["Carrot", "Beans", "Potato"],
    "Dhal Items": ["Toor Dal", "Moong Dal"],
    "Oil Items": ["Groundnut Oil"],
}

# --------------------------------------------------
# ✅ Load data at startup
# --------------------------------------------------
MEALS = load_json(MEAL_FILE) or DEFAULT_MEALS
GROCERIES = load_json(GROCERIES_FILE) or DEFAULT_GROCERIES

# ensure files exist on first run
save_json(MEAL_FILE, MEALS)
save_json(GROCERIES_FILE, GROCERIES)

# --------------------------------------------------
# ✅ Request Models
# --------------------------------------------------
class MealRequest(BaseModel):
    breakfast: bool = True
    lunch: bool = True
    dinner: bool = True
    snack: bool = True


class MealUpdate(BaseModel):
    breakfast_main: list
    breakfast_sidedish: list
    lunch_main: list
    lunch_secondmain: list
    lunch_poriyal: list
    dinner_main: list
    dinner_sidedish: list
    snack_main: list


class GroceryItems(BaseModel):
    category: str
    items: list


class RemoveMealRequest(BaseModel):
    meal_type: str
    category: str
    item_name: str


# --------------------------------------------------
# ✅ Root
# --------------------------------------------------
@app.get("/")
def read_root(username: str = Depends(verify_credentials)):
    return {"message": "Welcome to Healthy South Indian Meal Planner API!"}


# --------------------------------------------------
# ✅ Generate Weekly Meal Plan
# --------------------------------------------------
@app.post("/generate-meal-plan")
def generate_meal_plan(request: MealRequest, username: str = Depends(verify_credentials)):
    weekly_plan = []
    start_date = datetime.now()

    for day in range(7):
        current_date = start_date + timedelta(days=day)

        day_plan = {
            "day": current_date.strftime("%A"),
            "date": current_date.strftime("%d-%m-%Y"),
        }

        try:
            if request.breakfast:
                day_plan["breakfast"] = {
                    "main": random.choice(MEALS["breakfast"]["main"]),
                    "sidedish": random.choice(MEALS["breakfast"]["sidedish"]),
                }

            if request.lunch:
                day_plan["lunch"] = {
                    "main": random.choice(MEALS["lunch"]["main"]),
                    "second_main": random.choice(MEALS["lunch"]["second_main"]),
                    "poriyal": random.choice(MEALS["lunch"]["poriyal"]),
                }

            if request.dinner:
                day_plan["dinner"] = {
                    "main": random.choice(MEALS["dinner"]["main"]),
                    "sidedish": random.choice(MEALS["dinner"]["sidedish"]),
                }

            if request.snack:
                day_plan["snack"] = {
                    "main": random.choice(MEALS["snack"]["main"]),
                }

        except KeyError:
            return {"error": "Meals data structure is incorrect"}

        weekly_plan.append(day_plan)

    return {
        "note": "Weekly Meal Plan generated",
        "weekly_plan": weekly_plan,
    }


# --------------------------------------------------
# ✅ Meals APIs
# --------------------------------------------------
@app.get("/meals")
def get_meals(username: str = Depends(verify_credentials)):
    return {"meals": MEALS}


@app.post("/update-meals")
def update_meals(meal_update: MealUpdate, username: str = Depends(verify_credentials)):
    global MEALS

    MEALS = {
        "breakfast": {
            "main": meal_update.breakfast_main,
            "sidedish": meal_update.breakfast_sidedish,
        },
        "lunch": {
            "main": meal_update.lunch_main,
            "second_main": meal_update.lunch_secondmain,
            "poriyal": meal_update.lunch_poriyal,
        },
        "dinner": {
            "main": meal_update.dinner_main,
            "sidedish": meal_update.dinner_sidedish,
        },
        "snack": {
            "main": meal_update.snack_main,
        },
    }

    save_json(MEAL_FILE, MEALS)

    return {"message": "Meals updated permanently", "meals": MEALS}


@app.post("/remove-meal-item")
def remove_meal_item(request: RemoveMealRequest, username: str = Depends(verify_credentials)):
    global MEALS

    if (
        request.meal_type in MEALS
        and request.category in MEALS[request.meal_type]
    ):
        MEALS[request.meal_type][request.category] = [
            item
            for item in MEALS[request.meal_type][request.category]
            if item != request.item_name
        ]

        save_json(MEAL_FILE, MEALS)

    return {"message": "Meal item removed", "meals": MEALS}


# --------------------------------------------------
# ✅ Groceries APIs
# --------------------------------------------------
@app.get("/groceries")
def get_groceries(username: str = Depends(verify_credentials)):
    return {"groceries": GROCERIES}


@app.post("/add-groceries")
def add_groceries(request: GroceryItems, username: str = Depends(verify_credentials)):
    global GROCERIES

    if request.category not in GROCERIES:
        GROCERIES[request.category] = []

    for item in request.items:
        if item not in GROCERIES[request.category]:
            GROCERIES[request.category].append(item)

    save_json(GROCERIES_FILE, GROCERIES)

    return {"message": "Groceries added permanently", "groceries": GROCERIES}


@app.post("/remove-grocery/{category}/{item_name}")
def remove_grocery(category: str, item_name: str, username: str = Depends(verify_credentials)):
    global GROCERIES

    if category in GROCERIES and item_name in GROCERIES[category]:
        GROCERIES[category].remove(item_name)
        save_json(GROCERIES_FILE, GROCERIES)

    return {"message": "Grocery removed", "groceries": GROCERIES}


# --------------------------------------------------
# ✅ Serve React build (optional)
# --------------------------------------------------
frontend_build = Path(__file__).parent.parent / "frontend" / "build"
if frontend_build.exists():
    app.mount("/", StaticFiles(directory=str(frontend_build), html=True), name="static")