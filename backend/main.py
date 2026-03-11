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
    breakfast_main: list = []
    breakfast_sidedish: list = []
    lunch_main: list = []
    lunch_second_main: list = []
    lunch_poriyal: list = []
    dinner_main: list = []
    dinner_sidedish: list = []
    snack_main: list = []


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
    today = datetime.now()
    days_since_sunday = (today.weekday() + 1) % 7
    start_date = today - timedelta(days=days_since_sunday)

    # Copy lists
    breakfast_main = MEALS["breakfast"]["main"][:]
    breakfast_side = MEALS["breakfast"]["sidedish"][:]

    lunch_main = MEALS["lunch"]["main"][:]
    lunch_second = MEALS["lunch"]["second_main"][:]
    lunch_poriyal = MEALS["lunch"]["poriyal"][:]

    dinner_main = MEALS["dinner"]["main"][:]
    dinner_side = MEALS["dinner"]["sidedish"][:]

    snack_main = MEALS["snack"]["main"][:]

    # Shuffle
    random.shuffle(breakfast_main)
    random.shuffle(breakfast_side)
    random.shuffle(lunch_main)
    random.shuffle(lunch_second)
    random.shuffle(lunch_poriyal)
    random.shuffle(dinner_main)
    random.shuffle(dinner_side)
    random.shuffle(snack_main)

    # Track used items
    used = {
        "breakfast_main": set(),
        "breakfast_side": set(),
        "lunch_main": set(),
        "lunch_second": set(),
        "lunch_poriyal": set(),
        "dinner_main": set(),
        "dinner_side": set(),
        "snack_main": set(),
    }

    for day in range(7):

        current_date = start_date + timedelta(days=day)

        day_plan = {
            "day": current_date.strftime("%A"),
            "date": current_date.strftime("%d-%m-%Y"),
        }

        # BREAKFAST
        if request.breakfast:
            main = next((m for m in breakfast_main if m not in used["breakfast_main"]), None)
            side = next((s for s in breakfast_side if s not in used["breakfast_side"]), None)

            if main and side:
                used["breakfast_main"].add(main)
                used["breakfast_side"].add(side)

                day_plan["breakfast"] = {
                    "main": main,
                    "sidedish": side,
                }

        # LUNCH
        if request.lunch:

            main = next((m for m in lunch_main if m not in used["lunch_main"]), None)
            if main is None and lunch_main:
                main = random.choice(lunch_main)

            second = next((s for s in lunch_second if s not in used["lunch_second"]), None)
            if second is None and lunch_second:
                second = random.choice(lunch_second)

            poriyal = next((p for p in lunch_poriyal if p not in used["lunch_poriyal"]), None)
            if poriyal is None and lunch_poriyal:
                poriyal = random.choice(lunch_poriyal)

            if main:
                used["lunch_main"].add(main)

            if second:
                used["lunch_second"].add(second)

            if poriyal:
                used["lunch_poriyal"].add(poriyal)

            day_plan["lunch"] = {
                "main": main,
                "second_main": second,
                "poriyal": poriyal,
            }   

        # DINNER
        if request.dinner:
            main = next((m for m in dinner_main if m not in used["dinner_main"]), None)
            side = next((s for s in dinner_side if s not in used["dinner_side"]), None)

            if main and side:
                used["dinner_main"].add(main)
                used["dinner_side"].add(side)

                day_plan["dinner"] = {
                    "main": main,
                    "sidedish": side,
                }

        # SNACK
        if request.snack:
            snack = next((s for s in snack_main if s not in used["snack_main"]), None)

            if snack:
                used["snack_main"].add(snack)

                day_plan["snack"] = {
                    "main": snack,
                }

        weekly_plan.append(day_plan)

    return {
    "week_start": start_date.strftime("%d-%m-%Y"),
    "week_end": (start_date + timedelta(days=6)).strftime("%d-%m-%Y"),
    "weekly_plan": weekly_plan
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
            "second_main": meal_update.lunch_second_main,
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