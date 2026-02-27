# Healthy Meal Planner - Project Summary

## Project Overview

**Healthy South Indian Meal Planner** is a full-stack web application designed for families to plan weekly meals and manage grocery shopping lists. Built with React (frontend) and FastAPI (backend), it provides categorized meal and grocery management with export capabilities.

---

## Development Timeline & Features

### Phase 1: Core Setup
- ✅ FastAPI backend initialization with CORS support
- ✅ React frontend scaffolding
- ✅ Basic API endpoints structure

### Phase 2: Data Structure Implementation
- ✅ **MEALS Data**: 4-level nested structure
  - Meal Type (breakfast, lunch, dinner, snack)
  - Category (main, sidedish)
  - Items (array of dishes)
- ✅ **GROCERIES Data**: Categorized structure with 11 categories
  - Pooja Items, Dhal Items, Oil Items, Millet Items, Bathroom Items
  - Sundal Items, Flour Items, Masala Items, Dry Fruits
  - Samba Pettai Items, Other Items

### Phase 3: Frontend Features
- ✅ Home page with 4 navigation buttons
- ✅ **Groceries List Page**: View all groceries by category with checkboxes
- ✅ **Update Groceries Page**: Add/remove items by category
- ✅ **Update Meals Page**: Add/remove meal items by type and category
- ✅ **Generate 7-Day Meal Plan**: Auto-generate weekly meals with dates
- ✅ Error handling on all API calls

### Phase 4: Export Features
- ✅ **PDF Download**: Export groceries as formatted PDF with categories and date
  - Includes title, date, categorized items
  - Auto page breaks for long lists
  - Color-coded categories


### Phase 7: Bug Fixes & Optimization
- ✅ Syntax errors corrected
- ✅ Error handling added to all API calls
- ✅ Loading states and empty data checks
- ✅ Responsive UI with proper styling

---

## Technical Stack

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.x
- **Dependencies**:
  - fastapi==0.104.1
  - uvicorn==0.24.0
  - python-multipart==0.0.6
  - pydantic==2.5.0
- **Port**: 8000

### Frontend
- **Framework**: React 18
- **Language**: JavaScript (ES6+)
- **Dependencies**:
  - jspdf (for PDF generation)
- **Port**: 3000

### Deployment
- **VPN**: Tailscale (for private access)
- **Version Control**: Git/GitHub
- **Alternative Hosts**: Railway, Oracle Cloud, Heroku

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Root endpoint |
| GET | `/groceries` | Fetch all groceries |
| GET | `/meals` | Fetch all meals |
| POST | `/add-groceries` | Add items to grocery category |
| POST | `/remove-grocery/{category}/{item_name}` | Remove grocery item |
| POST | `/update-meals` | Update meal data |
| POST | `/remove-meal-item` | Remove meal item |
| POST | `/generate-meal-plan` | Generate 7-day meal plan |

---

## Project Structure

```
healthy-meal-planner/
├── backend/
│   ├── main.py                 # FastAPI server with all endpoints
│   ├── requirements.txt        # Python dependencies
│   └── __pycache__/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── App.js              # Main React component (all features)
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── (other React files)
│   ├── package.json
│   └── build/                  # Production build (generated)
├── .gitignore
├── README.md
└── (other config files)
```

---

## Features in Detail

### 1. Groceries List
- **View**: Browse all groceries organized by 11 categories
- **Select**: Check items you need
- **Export**: Download as CSV or PDF

### 2. Update Groceries
- **Display**: See current groceries by category with remove buttons
- **Add**: Input comma-separated items to any category
- **Remove**: Delete items one at a time
- **Duplicate Prevention**: Automatically prevents duplicate entries

### 3. Update Meals
- **Display**: Browse meals by type (breakfast, lunch, dinner, snack)
- **Sub-categories**: Main dishes and side dishes for each meal type
- **Add**: Select meal type/category and add items
- **Remove**: Delete items individually
- **Duplicate Prevention**: Checks for existing items before adding

### 4. Generate Meal Plan
- **7-Day Plan**: Auto-generate weekly meals
- **Dates**: Shows date for each day
- **Format**: Displays: "Breakfast: [main] + [sidedish]"
- **Random Selection**: Picks random items from meal database

### 5. Download Features
- **CSV Format**: 
  - File: `groceries-list-YYYY-MM-DD.csv`
  - Columns: Category, Items
  - Opens in Excel/Google Sheets
- **PDF Format**:
  - File: `groceries-list-YYYY-MM-DD.pdf`
  - Includes: Title, date, categorized items
  - Color-coded categories
  - Auto page breaks

---

## How to Run Locally

### Prerequisites
- Python 3.8+ installed
- Node.js 14+ installed
- Git installed

### Step 1: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/healthy-meal-planner.git
cd healthy-meal-planner
```

### Step 2: Start Backend
```powershell
# Terminal 1
cd backend
pip install -r requirements.txt
python main.py
# Should show: Uvicorn running on http://127.0.0.1:8000
```

### Step 3: Start Frontend
```powershell
# Terminal 2
cd frontend
npm install
npm start
# Should show: webpack compiled successfully
```

### Step 4: Access App
```
http://localhost:3000
```


---

## Future Enhancement Ideas

- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] User authentication (login/signup)
- [ ] Multiple family members with profiles
- [ ] Nutritional information tracking
- [ ] Recipe details and cooking instructions
- [ ] Price/cost calculations
- [ ] Shopping reminders/notifications
- [ ] Mobile app (React Native)
- [ ] Dark mode
- [ ] Dietary restrictions (vegan, gluten-free, etc.)
- [ ] Meal history and favorites
- [ ] Print-friendly view

---

## Debugging Tips

### Frontend Issues
- Open browser console: F12 → Console tab
- Check for JavaScript errors
- Look for network errors in Network tab
- Clear cache: Ctrl+Shift+Delete

### Backend Issues
- Check terminal output for error messages
- Verify port 8000 is not in use: `netstat -ano | findstr :8000`
- Restart backend server
- Check CORS settings if frontend can't connect

### Network Issues
- Verify API_BASE_URL in App.js points to correct backend
- Ping backend: `curl http://localhost:8000`
- Check firewall isn't blocking ports

---

## Git Commands Used

```bash
# Initialize repository
git init
git config user.email "email@example.com"
git config user.name "Your Name"

# Commit changes
git add .
git commit -m "Your message"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/healthy-meal-planner.git
git branch -M main
git push -u origin main

# View history
git log
git status
```

---

## Code Statistics

- **Backend Files**: 1 (main.py - ~250 lines)
- **Frontend Files**: 1 (App.js - ~740 lines)
- **Total LOC**: ~1000 lines
- **Dependencies**: 5 backend + 1 frontend (jsPDF)
- **API Endpoints**: 8
- **React Components**: 1 (monolithic, can be split later)
- **Pages**: 5 (Home, Groceries List, Update Groceries, Update Meals, Meal Plan)

---

## Commits Made During Development

1. "Initial commit: Healthy Meal Planner with groceries and meal management"
2. "Add error handling and CSV/PDF download features for groceries"
3. "Remove email functionality - all related files and code"

---

## Current Status

✅ **PRODUCTION READY**

All core features are working:
- Groceries management
- Meal planning
- Export functionality
- Error handling
- No compilation errors
- Deployable to multiple platforms

Ready for family use via Tailscale VPN!

---

## Support & Contact

For issues or questions:
1. Check browser console (F12)
2. Check backend terminal output
3. Verify both servers are running
4. Restart both servers
5. Check GitHub for latest code

---

**Last Updated**: February 27, 2026  
**Version**: 1.0.0  
**Status**: Stable & Tested
