# Healthy Meal Planner

A web application for planning and managing South Indian meals with grocery list management.

## Features

- **Groceries List**: Browse and select groceries by category
- **Update Groceries**: Add/remove items from 11 grocery categories
  - Pooja Items, Dhal Items, Oil Items, Millet Items, Bathroom Items
  - Sundal Items, Flour Items, Masala Items, Dry Fruits, Samba Pettai Items, Other Items
- **Update Meals Data**: Manage breakfast, lunch, dinner, and snack items (main & side dishes)
- **Generate 7-Day Meal Plan**: Automatically create a weekly meal plan with dates

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React.js
- **Database**: JSON-based (can be upgraded to database)

## Project Structure

```
healthy-meal-planner/
├── backend/
│   ├── main.py          # FastAPI server
│   └── __pycache__/
└── frontend/
    ├── src/
    │   ├── App.js       # Main React component
    │   ├── App.css      # Styling
    │   └── index.js     # Entry point
    ├── public/
    ├── package.json
    └── README.md
```

## Installation

### Backend Setup

```bash
cd backend
pip install fastapi uvicorn python-multipart
python main.py
```

The backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`

## API Endpoints

- `GET /groceries` - Fetch all groceries
- `GET /meals` - Fetch all meals
- `POST /add-groceries` - Add grocery items
- `POST /remove-grocery/{category}/{item_name}` - Remove grocery item
- `POST /update-meals` - Update meal data
- `POST /remove-meal-item` - Remove meal item
- `POST /generate-meal-plan` - Generate 7-day meal plan

## Usage

1. Start the backend server
2. Start the frontend development server
3. Open `http://localhost:3000` in your browser
4. Use the navigation buttons to:
   - View and select groceries
   - Update grocery list
   - Update meal data
   - Generate a meal plan

## Features in Detail

### Groceries List
- Browse all groceries organized by 11 categories
- Select items with checkboxes
- Generate a filtered list of selected items

### Update Groceries
- View current groceries by category
- Add new items to any category (comma-separated)
- Remove items with one click
- Prevents duplicate entries

### Update Meals
- View current meals organized by type (breakfast, lunch, dinner, snack)
- Each meal type has main dishes and side dishes
- Add new items to any meal/category combination
- Remove items easily

### Generate Meal Plan
- Creates a 7-day meal plan
- Displays with current date information
- Shows main and side dish for each meal

## License

MIT

## Author

Created for healthy meal planning
