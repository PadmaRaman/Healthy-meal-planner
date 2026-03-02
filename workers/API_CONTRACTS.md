🌐 Base URL (local)
http://localhost:8000
🏠 1. Health Check
Endpoint
GET /
Purpose

Check if API is running.

Response
{
  "message": "Welcome to Healthy South Indian Meal Planner API!"
}
🍽️ 2. Generate Weekly Meal Plan
Endpoint
POST /generate-meal-plan
Purpose

Generates a 7-day meal plan based on selected meals.

Request Body
{
  "breakfast": true,
  "lunch": true,
  "dinner": true,
  "snack": true
}
Field meanings
Field	Type	Required	Description
breakfast	boolean	optional	Include breakfast
lunch	boolean	optional	Include lunch
dinner	boolean	optional	Include dinner
snack	boolean	optional	Include snack
Response
{
  "note": "Weekly Meal Plan generated",
  "weekly_plan": [
    {
      "day": "Monday",
      "date": "03-03-2026",
      "breakfast": {
        "main": "Idli",
        "sidedish": "Sambar"
      },
      "lunch": {
        "main": "Sambar Rice",
        "sidedish": "Poriyal"
      }
    }
  ]
}
📋 3. Get Meals
Endpoint
GET /meals
Purpose

Fetch current meals master data.

Response
{
  "meals": {
    "breakfast": {
      "main": ["Idli", "Dosa"],
      "sidedish": ["Sambar"]
    },
    "lunch": {
      "main": ["Sambar Rice"],
      "sidedish": ["Poriyal"]
    }
  }
}
✏️ 4. Update Meals
Endpoint
POST /update-meals
Purpose

Replace entire meals dataset (permanent save).

⚠️ This overwrites everything

Request Body
{
  "breakfast_main": ["Idli", "Dosa"],
  "breakfast_sidedish": ["Sambar"],
  "lunch_main": ["Meals"],
  "lunch_sidedish": ["Poriyal"],
  "dinner_main": ["Chapati"],
  "dinner_sidedish": ["Kurma"],
  "snack_main": ["Sundal"],
  "snack_sidedish": ["Tea"]
}
Response
{
  "message": "Meals updated permanently",
  "meals": { ... }
}
❌ 5. Remove Meal Item
Endpoint
POST /remove-meal-item
Purpose

Remove a specific meal item.

Request Body
{
  "meal_type": "breakfast",
  "category": "main",
  "item_name": "Idli"
}
Field meanings
Field	Example
meal_type	breakfast / lunch / dinner / snack
category	main / sidedish
item_name	exact meal name
Response
{
  "message": "Meal item removed",
  "meals": { ... }
}
🛒 6. Get Groceries
Endpoint
GET /groceries
Purpose

Fetch grocery categories and items.

Response
{
  "groceries": {
    "Vegetables": ["Carrot", "Beans"],
    "Dhal Items": ["Toor Dal"]
  }
}
➕ 7. Add Groceries
Endpoint
POST /add-groceries
Purpose

Add items to a grocery category (permanent).

Request Body
{
  "category": "Vegetables",
  "items": ["Beetroot", "Cabbage"]
}
Response
{
  "message": "Groceries added permanently",
  "groceries": { ... }
}
🗑️ 8. Remove Grocery
Endpoint
POST /remove-grocery/{category}/{item_name}
Example
POST /remove-grocery/Vegetables/Carrot
Path Parameters
Param	Example
category	Vegetables
item_name	Carrot
Response
{
  "message": "Grocery removed",
  "groceries": { ... }
}