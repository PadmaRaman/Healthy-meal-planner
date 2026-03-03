import { useState, useEffect } from "react";
//useState lets us store form values and results
//useEffect lets us run code when the page loads
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
import { setBasicAuth, isLoggedIn, clearBasicAuth } from "./utils/auth";
import { apiFetch } from "./utils/api";

//const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
// eslint-disable-next-line no-unused-vars
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://healthy-meal-planner-0s0b.onrender.com";
/* const username = "admin";
const password = "fitmeal123";

const basicAuth = "Basic " + btoa(`${username}:${password}`);*/



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
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  // eslint-disable-next-line no-unused-vars
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

  const handleLogin = async () => {
      try {
        setBasicAuth(loginUser, loginPass);

        const res = await apiFetch("/meals"); // test call

        if (!res.ok) {
          throw new Error("Invalid credentials");
        }

        setLoggedIn(true);
      } catch (err) {
        clearBasicAuth();
        alert("Login failed");
      }
    };
// eslint-disable-next-line no-unused-vars
    const handleLogout = () => {
      clearBasicAuth();
      setLoggedIn(false);
    };

  // eslint-disable-next-line no-unused-vars
    const handleMealInputChange = (field, value) => 
    {
    setMealInputs({
      ...mealInputs,
      [field]: value
    });
  };

  // eslint-disable-next-line no-unused-vars
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

    const response = await apiFetch("/update-meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //"Authorization": basicAuth
      },
      body: JSON.stringify(mealData)
    });

    const result = await response.json();
    alert(result.message);
    setCurrentMeals(result.meals);
  };

  // Auto-fetch groceries when page changes to groceries or updateGroceries
  useEffect(() => {
    if (currentPage === "groceries") {
      handleFetchGroceries();
    }
    if (currentPage === "updateGroceries") {
      handleFetchCurrentGroceries();
    }
  }, [currentPage]);

  // Groceries List Component
  const handleFetchGroceries = async () => {
    try {
      const response = await apiFetch("/groceries");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setGroceryList(data.groceries);
      setSelectedGroceries({});
    } catch (error) {
      alert(`Error loading groceries: ${error.message}`);
      console.error("Error:", error);
    }
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
    try {
      const response = await apiFetch("/groceries", {
        headers: {
          //"Authorization": basicAuth
        }
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setGroceryList(data.groceries);
      setSelectedCategory(Object.keys(data.groceries)[0] || "");
    } catch (error) {
      alert(`Error loading groceries: ${error.message}`);
      console.error("Error:", error);
    }
  };

  const handleAddGroceryItem = async () => {
    if (!newGroceryItem.trim() || !selectedCategory) {
      alert("Please select a category and enter grocery items");
      return;
    }
    
    try {
      const itemsToAdd = newGroceryItem.split(",").map(item => item.trim()).filter(item => item);
      
      const response = await apiFetch("/add-groceries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //"Authorization": basicAuth
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
    } catch (error) {
      alert(`Error adding groceries: ${error.message}`);
      console.error("Error:", error);
    }
  };

  const handleRemoveGroceryItem = async (category, itemName) => {
    try {
      const response = await apiFetch(`/remove-grocery/${category}/${itemName}`, {
        method: "POST",
        headers: {
          //"Authorization": basicAuth
        }      
      });

      const result = await response.json();
      if (result.groceries) {
        setGroceryList(result.groceries);
      }
    } catch (error) {
      alert(`Error removing grocery: ${error.message}`);
      console.error("Error:", error);
    }
  };

  // Download Groceries List as CSV
  const handleDownloadGroceriesList = () => {
    if (Object.values(generatedGroceries).every(items => items.length === 0)) {
      alert("Please generate a groceries list first");
      return;
    }

    // Create CSV content
    let csvContent = "Category,Items\n";
    Object.keys(generatedGroceries).forEach((category) => {
      if (generatedGroceries[category].length > 0) {
        const items = generatedGroceries[category].join("; ");
        // Escape quotes in items
        const escapedItems = items.replace(/"/g, '""');
        csvContent += `"${category}","${escapedItems}"\n`;
      }
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `groceries-list-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Groceries List as PDF
  const handleDownloadGroceriesPDF = () => {
    if (Object.values(generatedGroceries).every(items => items.length === 0)) {
      alert("Please generate a groceries list first");
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text("Healthy Meal Planner", 20, 20);
    
    // Subtitle
    doc.setFontSize(12);
    doc.text("Groceries List", 20, 30);
    
    // Date
    doc.setFontSize(10);
    const today = new Date().toLocaleDateString();
    doc.text(`Date: ${today}`, 20, 38);
    
    // Content
    let yPosition = 50;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    
    doc.setFontSize(11);
    
    Object.keys(generatedGroceries).forEach((category) => {
      if (generatedGroceries[category].length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Category heading
        doc.setFont(undefined, "bold");
        doc.setTextColor(76, 175, 80); // Green color
        doc.text(`${category}:`, margin, yPosition);
        yPosition += 8;
        
        // Items
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
        const items = generatedGroceries[category];
        items.forEach((item) => {
          // Wrap text if too long
          const wrappedText = doc.splitTextToSize(`• ${item}`, 170);
          wrappedText.forEach((line) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin + 5, yPosition);
            yPosition += 6;
          });
        });
        
        yPosition += 4; // Extra space between categories
      }
    });
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated from Healthy South Indian Meal Planner", margin, pageHeight - 10);
    
    // Save PDF
    const fileName = `groceries-list-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  // Input JSON Data Component
  const handleFetchCurrentMeals = async () => {
    const response = await apiFetch("/meals", {
        headers: {
          //"Authorization": basicAuth
        }
      });
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

    const response = await apiFetch("/update-meals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", 
        //"Authorization": basicAuth
        },
        body: JSON.stringify(mealData)
      });

    const result = await response.json();
    alert(result.message);
    setCurrentMeals(result.meals);
    setNewMealItem("");
  };

  const handleRemoveMealItem = async (mealType, category, itemName) => {
    const response = await apiFetch("/remove-meal-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //"Authorization": basicAuth
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
    const response = await apiFetch("/generate-meal-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        //"Authorization": basicAuth
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


// Login Functionality
  if (!loggedIn) {
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="card p-4 shadow" style={{ width: "320px" }}>
        <h4 className="mb-3 text-center">FitMeal Login</h4>

        <input
          className="form-control mb-2"
          placeholder="Username"
          value={loginUser}
          onChange={(e) => setLoginUser(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          value={loginPass}
          onChange={(e) => setLoginPass(e.target.value)}
        />

        <button className="btn btn-success w-100" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}




  return (
    <div className="container-fluid py-3" style={{ fontFamily: "Arial, sans-serif" }}>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4 pd-5">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <img
              src="/fitmeal_south_logo.png"
              alt="FitMeal South Logo"
              style={{ height: "40px", width: "auto", marginRight: "10px" }}
            />
            <h1 className="h4 mb-0 fw-bold text-white">FitMeal South</h1>
          </div>
        </div>
      </nav>
    
      {currentPage === "home" && (
        <div className="mt-4">

          {/* Row 1 */}
          <div className="row g-3 mb-2">
            <div className="col-12 col-md-6">
              <button
                onClick={() => { setCurrentPage("updateGroceries"); handleFetchCurrentGroceries(); }}
                className="btn btn-primary w-100 py-3"
              >
                Update Groceries
              </button>
            </div>

            <div className="col-12 col-md-6">
              <button
                onClick={() => { setCurrentPage("groceries"); handleFetchGroceries(); }}
                className="btn btn-primary w-100 py-3"
              >
                Generate Groceries
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <button
                onClick={() => { setCurrentPage("inputJson"); handleFetchCurrentMeals(); }}
                className="btn btn-warning w-100 py-3"
              >
                Update Meals
              </button>
            </div>

            <div className="col-12 col-md-6">
              <button
                onClick={() => setCurrentPage("mealPlan")}
                className="btn btn-warning w-100 py-3"
              >
                Generate Meals
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Groceries List Page */}
      {currentPage === "groceries" && (
        <div>
          <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>Back to Home</button>
          <h2>Groceries List</h2>
          
          {Object.keys(groceryList).length === 0 ? (
            <p style={{ color: "#666", fontSize: "16px" }}>No groceries loaded. Please wait or refresh the page.</p>
          ) : (
            <>
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
            </>
          )}

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
              <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button onClick={handleDownloadGroceriesList} style={{ ...buttonStyle, backgroundColor: "#2196F3" }}>
                  ⬇️ Download as CSV
                </button>
                <button onClick={handleDownloadGroceriesPDF} style={{ ...buttonStyle, backgroundColor: "#FF5722" }}>
                  📄 Download as PDF
                </button>
              </div>
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

export default App;