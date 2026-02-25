import { useState } from "react";
//useState lets us store form values and results

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState({});
  const [selectedGroceries, setSelectedGroceries] = useState({});
  const [generatedGroceries, setGeneratedGroceries] = useState({});
  const [currentMeals, setCurrentMeals] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedMealCategory, setSelectedMealCategory] = useState("main");
  const [newGroceryItem, setNewGroceryItem] = useState("");
  const [newMealItem, setNewMealItem] = useState("");
  const [mealInputs, setMealInputs] = useState({
    breakfast_main: "",
    breakfast_sidedish: "",
    lunch_main: "",
    lunch_sidedish: "",
    dinner_main: "",
    dinner_sidedish: "",
    snack_main: "",
    snack_sidedish: ""
  });

  // Groceries List Component
  const handleFetchGroceries = async () => {
    const response = await fetch("http://localhost:8000/groceries");
    const data = await response.json();
    setGroceryList(data.groceries);
    setSelectedGroceries({});
  };

  const handleGroceryToggle = (category, item) => {
    const key = `${category}-${item}`;
    setSelectedGroceries({
      ...selectedGroceries,
      [key]: !selectedGroceries[key]
    });
  };

  const handleGenerateGroceryList = () => {
    const selected = {};
    Object.keys(groceryList).forEach((category) => {
      selected[category] = groceryList[category].filter((item) => selectedGroceries[`${category}-${item}`]);
    });
    setGeneratedGroceries(selected);
  };

  // Update Groceries Component
  const handleFetchCurrentGroceries = async () => {
    const response = await fetch("http://localhost:8000/groceries");
    const data = await response.json();
    setGroceryList(data.groceries);
    setSelectedCategory(Object.keys(data.groceries)[0] || "");
  };

  const handleAddGroceryItem = async () => {
    if (!newGroceryItem.trim() || !selectedCategory) {
      alert("Please select a category and enter grocery items");
      return;
    }
    
    const itemsToAdd = newGroceryItem.split(",").map(item => item.trim()).filter(item => item);
    
    const response = await fetch("http://localhost:8000/add-groceries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ category: selectedCategory, items: itemsToAdd })
    });

    const result = await response.json();
    if (result.message) {
      alert(result.message);
    }
    if (result.groceries) {
      setGroceryList(result.groceries);
    } else {
      alert("Error: Could not add groceries. " + JSON.stringify(result));
    }
    setNewGroceryItem("");
  };

  const handleRemoveGroceryItem = async (category, itemName) => {
    const response = await fetch(`http://localhost:8000/remove-grocery/${category}/${itemName}`, {
      method: "POST"
    });

    const result = await response.json();
    if (result.groceries) {
      setGroceryList(result.groceries);
    }
  };

  // Input JSON Data Component
  const handleFetchCurrentMeals = async () => {
    const response = await fetch("http://localhost:8000/meals");
    const data = await response.json();
    setCurrentMeals(data.meals);
    // Pre-populate the input fields with current data
    setMealInputs({
      breakfast_main: data.meals.breakfast.main.join(", "),
      breakfast_sidedish: data.meals.breakfast.sidedish.join(", "),
      lunch_main: data.meals.lunch.main.join(", "),
      lunch_sidedish: data.meals.lunch.sidedish.join(", "),
      dinner_main: data.meals.dinner.main.join(", "),
      dinner_sidedish: data.meals.dinner.sidedish.join(", "),
      snack_main: data.meals.snack.main.join(", "),
      snack_sidedish: data.meals.snack.sidedish.join(", ")
    });
  };

  const handleMealInputChange = (field, value) => {
    setMealInputs({
      ...mealInputs,
      [field]: value
    });
  };

  const handleUpdateMeals = async () => {
    const mealData = {
      breakfast_main: mealInputs.breakfast_main.split(",").map(item => item.trim()).filter(item => item),
      breakfast_sidedish: mealInputs.breakfast_sidedish.split(",").map(item => item.trim()).filter(item => item),
      lunch_main: mealInputs.lunch_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_sidedish: mealInputs.lunch_sidedish.split(",").map(item => item.trim()).filter(item => item),
      dinner_main: mealInputs.dinner_main.split(",").map(item => item.trim()).filter(item => item),
      dinner_sidedish: mealInputs.dinner_sidedish.split(",").map(item => item.trim()).filter(item => item),
      snack_main: mealInputs.snack_main.split(",").map(item => item.trim()).filter(item => item),
      snack_sidedish: mealInputs.snack_sidedish.split(",").map(item => item.trim()).filter(item => item)
    };

    const response = await fetch("http://localhost:8000/update-meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mealData)
    });

    const result = await response.json();
    alert(result.message);
    setCurrentMeals(result.meals);
  };

  const handleAddMealItem = async () => {
    if (!newMealItem.trim() || !selectedMealType) {
      alert("Please select a meal type and enter items");
      return;
    }
    
    const itemsToAdd = newMealItem.split(",").map(item => item.trim()).filter(item => item);
    
    // Build the meal data with all current meals
    const mealData = {
      breakfast_main: currentMeals.breakfast.main,
      breakfast_sidedish: currentMeals.breakfast.sidedish,
      lunch_main: currentMeals.lunch.main,
      lunch_sidedish: currentMeals.lunch.sidedish,
      dinner_main: currentMeals.dinner.main,
      dinner_sidedish: currentMeals.dinner.sidedish,
      snack_main: currentMeals.snack.main,
      snack_sidedish: currentMeals.snack.sidedish
    };

    // Add new items to the selected category
    const categoryKey = `${selectedMealType}_${selectedMealCategory}`;
    itemsToAdd.forEach(item => {
      if (!mealData[categoryKey].includes(item)) {
        mealData[categoryKey].push(item);
      }
    });

    const response = await fetch("http://localhost:8000/update-meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(mealData)
    });

    const result = await response.json();
    alert(result.message);
    setCurrentMeals(result.meals);
    setNewMealItem("");
  };

  const handleRemoveMealItem = async (mealType, category, itemName) => {
    const response = await fetch(`http://localhost:8000/remove-meal-item`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        meal_type: mealType,
        category: category,
        item_name: itemName
      })
    });

    const result = await response.json();
    setCurrentMeals(result.meals);
    handleFetchCurrentMeals();
  };

  // Generate Meal Plan Component
  const handleGenerateMealPlan = async () => {
    const response = await fetch("http://localhost:8000/generate-meal-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        breakfast: true,
        lunch: true,
        dinner: true,
        snack: true
      })
    });

    const data = await response.json();
    setMealPlan(data);
  };

  // Style definitions
  const buttonStyle = {
    margin: "10px",
    padding: "15px 30px",
    fontSize: "16px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    minWidth: "150px"
  };

  const backButtonStyle = {
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "20px"
  };

  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    marginTop: "20px",
    border: "1px solid #ddd"
  };

  const thStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "12px",
    textAlign: "left",
    border: "1px solid #ddd"
  };

  const tdStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left"
  };

  const formGroupStyle = {
    marginBottom: "15px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "5px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box"
  };

  const dayPlanStyle = {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    marginTop: "15px",
    borderLeft: "4px solid #4CAF50",
    borderRadius: "4px"
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Healthy South Indian Meal Planner</h1>

      {currentPage === "home" && (
        <div style={{ marginTop: "30px" }}>
          <button onClick={() => { setCurrentPage("groceries"); handleFetchGroceries(); }} style={buttonStyle}>
            Groceries List
          </button>
          <button onClick={() => { setCurrentPage("updateGroceries"); handleFetchCurrentGroceries(); }} style={buttonStyle}>
            Update Groceries List
          </button>
          <button onClick={() => { setCurrentPage("inputJson"); handleFetchCurrentMeals(); }} style={buttonStyle}>
            Update Meals Data
          </button>
          <button onClick={() => setCurrentPage("mealPlan")} style={buttonStyle}>
            Generate Meal Plan
          </button>
        </div>
      )}

      {/* Groceries List Page */}
      {currentPage === "groceries" && (
        <div>
          <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>Back to Home</button>
          <h2>Groceries List</h2>
          
          {Object.keys(groceryList).map((category) => (
            <div key={category} style={{ marginBottom: "20px", backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "4px" }}>
              <h3 style={{ color: "#4CAF50", marginTop: 0 }}>{category}</h3>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Item</th>
                    <th style={thStyle}>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {groceryList[category].map((item) => (
                    <tr key={`${category}-${item}`}>
                      <td style={tdStyle}>{item}</td>
                      <td style={tdStyle}>
                        <input
                          type="checkbox"
                          checked={selectedGroceries[`${category}-${item}`] || false}
                          onChange={() => handleGroceryToggle(category, item)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <button onClick={handleGenerateGroceryList} style={{ ...buttonStyle, marginTop: "20px" }}>
            Generate Grocery List
          </button>

          {Object.values(generatedGroceries).some(items => items.length > 0) && (
            <div style={{ marginTop: "30px" }}>
              <h3>Selected Groceries</h3>
              {Object.keys(generatedGroceries).map((category) => (
                generatedGroceries[category].length > 0 && (
                  <div key={category} style={{ marginBottom: "15px" }}>
                    <h4 style={{ color: "#4CAF50" }}>{category}</h4>
                    <ul>
                      {generatedGroceries[category].map((item) => (
                        <li key={`${category}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input JSON Data Page */}
      {currentPage === "inputJson" && (
        <div>
          <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>Back to Home</button>
          <h2>Update Meal Data</h2>

          {/* Display Current Meals by Type and Category */}
          {currentMeals && (
            <div style={{ marginBottom: "30px", backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "4px" }}>
              <h3>Current Meals in JSON</h3>
              {Object.keys(currentMeals).map((mealType) => (
                <div key={mealType} style={{ marginBottom: "20px", backgroundColor: "white", padding: "10px", borderRadius: "3px", border: "1px solid #ddd" }}>
                  <h4 style={{ color: "#4CAF50", marginTop: 0, textTransform: "capitalize" }}>{mealType}</h4>
                  
                  {/* Main Dishes */}
                  <div style={{ marginBottom: "15px" }}>
                    <h5 style={{ marginBottom: "10px" }}>Main Dishes</h5>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Item</th>
                          <th style={thStyle}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMeals[mealType].main.map((item) => (
                          <tr key={`${mealType}-main-${item}`}>
                            <td style={tdStyle}>{item}</td>
                            <td style={tdStyle}>
                              <button 
                                onClick={() => handleRemoveMealItem(mealType, "main", item)}
                                style={{ padding: "8px 12px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Side Dishes */}
                  <div>
                    <h5 style={{ marginBottom: "10px" }}>Side Dishes</h5>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Item</th>
                          <th style={thStyle}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentMeals[mealType].sidedish.map((item) => (
                          <tr key={`${mealType}-sidedish-${item}`}>
                            <td style={tdStyle}>{item}</td>
                            <td style={tdStyle}>
                              <button 
                                onClick={() => handleRemoveMealItem(mealType, "sidedish", item)}
                                style={{ padding: "8px 12px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Meal Items */}
          <div style={{ backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "4px" }}>
            <h3>Add New Meal Items</h3>
            
            <div style={formGroupStyle}>
              <label>Select Meal Type:</label>
              <select 
                value={selectedMealType} 
                onChange={(e) => setSelectedMealType(e.target.value)}
                style={{ ...inputStyle, marginTop: "5px" }}
              >
                <option value="">-- Select a meal type --</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label>Select Category:</label>
              <select 
                value={selectedMealCategory} 
                onChange={(e) => setSelectedMealCategory(e.target.value)}
                style={{ ...inputStyle, marginTop: "5px" }}
              >
                <option value="main">Main Dishes</option>
                <option value="sidedish">Side Dishes</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label>Add New Items (comma-separated):</label>
              <input
                type="text"
                placeholder="e.g., Idli, Dosa, Upma"
                value={newMealItem}
                onChange={(e) => setNewMealItem(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button onClick={handleAddMealItem} style={buttonStyle}>
              Add Meal Items
            </button>
          </div>
        </div>
      )}

      {/* Update Groceries List Page */}
      {currentPage === "updateGroceries" && (
        <div>
          <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>Back to Home</button>
          <h2>Update Groceries List</h2>

          {/* Display Current Groceries by Category */}
          {groceryList && Object.keys(groceryList).length > 0 && (
            <div style={{ marginBottom: "30px", backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "4px" }}>
              <h3>Current Groceries in JSON</h3>
              {Object.keys(groceryList).map((category) => (
                <div key={category} style={{ marginBottom: "20px", backgroundColor: "white", padding: "10px", borderRadius: "3px", border: "1px solid #ddd" }}>
                  <h4 style={{ color: "#4CAF50", marginTop: 0 }}>{category}</h4>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Item</th>
                        <th style={thStyle}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groceryList[category].map((item) => (
                        <tr key={`${category}-${item}`}>
                          <td style={tdStyle}>{item}</td>
                          <td style={tdStyle}>
                            <button 
                              onClick={() => handleRemoveGroceryItem(category, item)}
                              style={{ padding: "8px 12px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <div style={{ backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "4px" }}>
            <h3>Add New Items to a Category</h3>
            <div style={formGroupStyle}>
              <label>Select Category:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ ...inputStyle, marginTop: "5px" }}
              >
                <option value="">-- Select a category --</option>
                {Object.keys(groceryList).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label>Add New Grocery Items (comma-separated):</label>
              <input
                type="text"
                placeholder="e.g., Tomato, Onion, Garlic"
                value={newGroceryItem}
                onChange={(e) => setNewGroceryItem(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button onClick={handleAddGroceryItem} style={buttonStyle}>
              Add Grocery Items
            </button>
          </div>
        </div>
      )}

      {/* Generate Meal Plan Page */}
      {currentPage === "mealPlan" && (
        <div>
          <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>Back to Home</button>
          <h2>Generate Meal Plan</h2>
          <button onClick={handleGenerateMealPlan} style={buttonStyle}>
            Generate 7-Day Meal Plan
          </button>

          {mealPlan && (
            <div style={{ marginTop: "30px" }}>
              <h3>Weekly Meal Plan - {mealPlan.note}</h3>
              {mealPlan.weekly_plan.map((day, index) => (
                <div key={index} style={dayPlanStyle}>
                  <h4>{day.day} - {day.date}</h4>
                  {day.breakfast && (
                    <p><b>Breakfast:</b> {day.breakfast.main} + {day.breakfast.sidedish}</p>
                  )}
                  {day.lunch && (
                    <p><b>Lunch:</b> {day.lunch.main} + {day.lunch.sidedish}</p>
                  )}
                  {day.dinner && (
                    <p><b>Dinner:</b> {day.dinner.main} + {day.dinner.sidedish}</p>
                  )}
                  {day.snack && (
                    <p><b>Snack:</b> {day.snack.main} + {day.snack.sidedish}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Styles
const buttonStyle = {
  margin: "10px",
  padding: "15px 30px",
  fontSize: "16px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  minWidth: "150px"
};

const backButtonStyle = {
  padding: "10px 20px",
  fontSize: "14px",
  backgroundColor: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  marginBottom: "20px"
};

const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
  marginTop: "20px",
  border: "1px solid #ddd"
};

const thStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "12px",
  textAlign: "left",
  border: "1px solid #ddd"
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "left"
};

const formGroupStyle = {
  marginBottom: "15px"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  fontSize: "14px",
  boxSizing: "border-box"
};

const dayPlanStyle = {
  backgroundColor: "#f9f9f9",
  padding: "15px",
  marginTop: "15px",
  borderLeft: "4px solid #4CAF50",
  borderRadius: "4px"
};

export default App;