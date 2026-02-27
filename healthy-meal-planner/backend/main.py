from fastapi import FastAPI
#FastAPI is the web framework we use to create APIs
from pydantic import BaseModel
#BaseMode is a class from the Pydantic library that we use to define data models for our API.Here it helps to validate JSON data
import random
#We use random to pick meals from our dataset
from fastapi.middleware.cors import CORSMiddleware
#CORS (Cross-Origin Resource Sharing) is a security feature implemented by web browsers to restrict web pages from making requests to a different domain than the one that served the web page. In our case, we need to allow requests from our frontend (which might be running on a different port) to access our backend API. We will configure CORS later in the code.
from datetime import datetime, timedelta
#We use datetime to get current date and generate 7-day meal plans

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MealRequest(BaseModel):
    #This class defines the structure of the request body for our API endpoint. It expects a JSON object with a single field "meal_type" which is a string.
    breakfast: bool = True
    lunch: bool = True
    dinner: bool = True
    snack: bool = True

class MealUpdate(BaseModel):
    #This class defines the structure for updating meals
    breakfast_main: list
    breakfast_sidedish: list
    lunch_main: list
    lunch_sidedish: list
    dinner_main: list
    dinner_sidedish: list
    snack_main: list
    snack_sidedish: list
    
MEALS = {
    "breakfast": {
        "main": [
            "Idli with sambar",
            "Ragi dosa",
            "Vegetable upma"
        ],
        "sidedish": [
            "Adai with chutney",
            "Coconut chutney",
            "Tomato chutney"
        ]
    },
    "lunch": {
        "main": [
            "Brown rice with sambar and poriyal",
            "Millet curd rice",
            "Vegetable kootu with rice"
        ],
        "sidedish": [
            "Rasam with vegetables",
            "Pickle",
            "Papad"
        ]
    },
    "dinner": {
        "main": [
            "Chapati with veg kurma",
            "Vegetable uthappam",
            "Ragi dosa"
        ],
        "sidedish": [
            "Tomato soup with sundal",
            "Cucumber salad",
            "Curd rice"
        ]
    },
    "snack": {
        "main": [
            "Sundal",
            "Roasted peanuts"
        ],
        "sidedish": [
            "Buttermilk",
            "Fruit bowl",
            "Yogurt"
        ]
    }
}

GROCERIES = {
    "Pooja Items": [],
    "Dhal Items": ["Toor Dhal", "Moong Dhal", "Chana Dhal"],
    "Oil Items": ["Coconut Oil", "Sunflower Oil", "Sesame Oil"],
    "Millet Items": ["Ragi", "Bajra", "Jowar"],
    "Bathroom Items": ["Soap", "Shampoo", "Towel"],
    "Sundal Items": ["Groundnuts", "Chickpeas", "Black Chickpeas"],
    "Flour Items": ["Rice Flour", "Wheat Flour", "Ragi Flour"],
    "Masala Items": ["Turmeric", "Chili Powder", "Cumin"],
    "Dry Fruits": ["Almonds", "Cashews", "Raisins"],
    "Samba Pettai Items": ["Rice", "Wheat", "Millets"],
    "Other Items": ["Salt", "Sugar", "Vegetables"]
}

@app.get("/")
def read_root():
    #This function defines the root endpoint of our API. When a GET request is made to the root URL ("/"), this function will be called and it returns a simple JSON message welcoming users to the Meal Planner API.
    return {"message": "Welcome to the Meal Planner API!"}
    
@app.post("/generate-meal-plan")
def generate_meal_plan(request: MealRequest):
        #This function is the API endpoint that generates a meal plan based on the user's input. It takes a MealRequest object as input, which contains the user's age, goal, calories, and number of people. The function then randomly selects meals from the MEALS dictionary based on the meal type specified in the request and returns a 7-day meal plan.
        weekly_plan = []
        start_date = datetime.now()
        
        for day in range(7):
            current_date = start_date + timedelta(days=day)
            day_name = current_date.strftime("%A")
            date_str = current_date.strftime("%d-%m-%Y")
            
            day_plan = {
                "day": day_name,
                "date": date_str
            }
            
            if request.breakfast:
                breakfast_main = random.choice(MEALS["breakfast"]["main"])
                breakfast_side = random.choice(MEALS["breakfast"]["sidedish"])
                day_plan["breakfast"] = {"main": breakfast_main, "sidedish": breakfast_side}
            
            if request.lunch:
                lunch_main = random.choice(MEALS["lunch"]["main"])
                lunch_side = random.choice(MEALS["lunch"]["sidedish"])
                day_plan["lunch"] = {"main": lunch_main, "sidedish": lunch_side}
            
            if request.dinner:
                dinner_main = random.choice(MEALS["dinner"]["main"])
                dinner_side = random.choice(MEALS["dinner"]["sidedish"])
                day_plan["dinner"] = {"main": dinner_main, "sidedish": dinner_side}
            
            if request.snack:
                snack_main = random.choice(MEALS["snack"]["main"])
                snack_side = random.choice(MEALS["snack"]["sidedish"])
                day_plan["snack"] = {"main": snack_main, "sidedish": snack_side}
            
            weekly_plan.append(day_plan)
        
        return {
            "note": f"Weekly Meal Plan generated",
            "weekly_plan": weekly_plan
        }

@app.get("/groceries")
def get_groceries():
    #This endpoint returns the list of groceries
    return {"groceries": GROCERIES}

@app.post("/update-meals")
def update_meals(meal_update: MealUpdate):
    #This endpoint updates the MEALS JSON with new data provided by the user
    global MEALS
    MEALS = {
        "breakfast": {
            "main": meal_update.breakfast_main,
            "sidedish": meal_update.breakfast_sidedish
        },
        "lunch": {
            "main": meal_update.lunch_main,
            "sidedish": meal_update.lunch_sidedish
        },
        "dinner": {
            "main": meal_update.dinner_main,
            "sidedish": meal_update.dinner_sidedish
        },
        "snack": {
            "main": meal_update.snack_main,
            "sidedish": meal_update.snack_sidedish
        }
    }
    return {"message": "Meals updated successfully", "meals": MEALS}
@app.get("/meals")
def get_meals():
    #This endpoint returns the current MEALS JSON
    return {"meals": MEALS}

class GroceryItems(BaseModel):
    category: str
    items: list

@app.post("/add-groceries")
def add_groceries(request: GroceryItems):
    #This endpoint adds new groceries to a specific category
    global GROCERIES
    if request.category not in GROCERIES:
        GROCERIES[request.category] = []
    
    for item in request.items:
        if item not in GROCERIES[request.category]:
            GROCERIES[request.category].append(item)
    
    return {"message": "Groceries added successfully", "groceries": GROCERIES}

@app.post("/remove-grocery/{category}/{item_name}")
def remove_grocery(category: str, item_name: str):
    #This endpoint removes a grocery item from a specific category
    global GROCERIES
    if category in GROCERIES and item_name in GROCERIES[category]:
        GROCERIES[category].remove(item_name)
    return {"message": "Grocery removed successfully", "groceries": GROCERIES}

class RemoveMealRequest(BaseModel):
    meal_type: str
    category: str
    item_name: str

@app.post("/remove-meal-item")
def remove_meal_item(request: RemoveMealRequest):
    #This endpoint removes a meal item from the MEALS JSON
    global MEALS
    if request.meal_type in MEALS and request.category in MEALS[request.meal_type]:
        MEALS[request.meal_type][request.category] = [item for item in MEALS[request.meal_type][request.category] if item != request.item_name]
    return {"message": "Meal item removed successfully", "meals": MEALS}