import { useState, useEffect } from "react";
//useState lets us store form values and results
//useEffect lets us run code when the page loads
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
import { setBasicAuth, isLoggedIn, clearBasicAuth } from "./utils/auth";
import { apiFetch } from "./utils/api";
import MealPage from "./components/MealPage";
import "./styles/MealsManagement.css";

// eslint-disable-next-line no-unused-vars
const API_BASE_URL = "http://localhost:8000";
// eslint-disable-next-line no-unused-vars
//const API_BASE_URL = process.env.REACT_APP_API_URL || "https://healthy-meal-planner-0s0b.onrender.com";
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
  const [selectedDay, setSelectedDay] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [mealInputs, setMealInputs] = useState({
    breakfast_main: "",
    breakfast_sidedish: "",
    lunch_monday_main: "",
    lunch_tuesday_main: "",
    lunch_wednesday_main: "",
    lunch_thursday_main: "",
    lunch_friday_main: "",
    lunch_saturday_main: "",
    lunch_sunday_main: "",
    lunch_second_main: "",
    lunch_poriyal: "",
    dinner_main: "",
    dinner_sidedish: "",
    snack_main: "",
    snack_sidedish: "",
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
      lunch_monday_main: mealInputs.lunch_monday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_tuesday_main: mealInputs.lunch_tuesday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_wednesday_main: mealInputs.lunch_wednesday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_thursday_main: mealInputs.lunch_thursday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_friday_main: mealInputs.lunch_friday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_saturday_main: mealInputs.lunch_saturday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_sunday_main: mealInputs.lunch_sunday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_second_main: mealInputs.lunch_second_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_poriyal: mealInputs.lunch_poriyal.split(",").map(item => item.trim()).filter(item => item),
      dinner_main: mealInputs.dinner_main.split(",").map(item => item.trim()).filter(item => item),
      dinner_sidedish: mealInputs.dinner_sidedish.split(",").map(item => item.trim()).filter(item => item),
    };

    try {
      const response = await apiFetch("/update-meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //"Authorization": basicAuth
        },
        body: JSON.stringify(mealData)
      });

      const result = await response.json();
      setCurrentMeals(result.meals);
      
      // Sync UI form inputs with backend data
      setMealInputs({
        breakfast_main: (result.meals?.breakfast?.main || []).join(", "),
        breakfast_sidedish: (result.meals?.breakfast?.sidedish || []).join(", "),
        lunch_monday_main: (result.meals?.lunch?.monday_main || []).join(", "),
        lunch_tuesday_main: (result.meals?.lunch?.tuesday_main || []).join(", "),
        lunch_wednesday_main: (result.meals?.lunch?.wednesday_main || []).join(", "),
        lunch_thursday_main: (result.meals?.lunch?.thursday_main || []).join(", "),
        lunch_friday_main: (result.meals?.lunch?.friday_main || []).join(", "),
        lunch_saturday_main: (result.meals?.lunch?.saturday_main || []).join(", "),
        lunch_sunday_main: (result.meals?.lunch?.sunday_main || []).join(", "),
        lunch_second_main: (result.meals?.lunch?.second_main || []).join(", "),
        lunch_poriyal: (result.meals?.lunch?.poriyal || []).join(", "),
        dinner_main: (result.meals?.dinner?.main || []).join(", "),
        dinner_sidedish: (result.meals?.dinner?.sidedish || []).join(", "),
      });
      
      // Verify synchronization with backend
      const syncResponse = await apiFetch("/meals-sync-status");
      const syncData = await syncResponse.json();
      console.log("✅ Meals synced at:", syncData.timestamp);
      console.log("📊 Meal items count:", {
        breakfast: syncData.breakfast_items,
        lunch: syncData.lunch_items,
        dinner: syncData.dinner_items,
      });
      
      alert("✅ " + result.message + "\n📊 Data synchronized and ready for meal plan generation!");
    } catch (error) {
      alert(`❌ Error updating meals: ${error.message}`);
      console.error("Error:", error);
    }
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

  // Download Meal Payload as JSON
  const handleDownloadMealPayload = () => {
    // Build payload from mealInputs
    const payload = {
      breakfast_main: mealInputs.breakfast_main.split(",").map(item => item.trim()).filter(item => item),
      breakfast_sidedish: mealInputs.breakfast_sidedish.split(",").map(item => item.trim()).filter(item => item),
      lunch_monday_main: mealInputs.lunch_monday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_tuesday_main: mealInputs.lunch_tuesday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_wednesday_main: mealInputs.lunch_wednesday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_thursday_main: mealInputs.lunch_thursday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_friday_main: mealInputs.lunch_friday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_saturday_main: mealInputs.lunch_saturday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_sunday_main: mealInputs.lunch_sunday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_second_main: mealInputs.lunch_second_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_poriyal: mealInputs.lunch_poriyal.split(",").map(item => item.trim()).filter(item => item),
      dinner_main: mealInputs.dinner_main.split(",").map(item => item.trim()).filter(item => item),
      dinner_sidedish: mealInputs.dinner_sidedish.split(",").map(item => item.trim()).filter(item => item),
    };

    // Create JSON string with pretty formatting
    const jsonContent = JSON.stringify(payload, null, 2);

    // Create blob and download
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `meal-payload-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Input JSON Data Component
  const handleFetchCurrentMeals = async () => {
    const response = await apiFetch("/meals", {
        headers: {
          //"Authorization": basicAuth
        }
      });
    const data = await response.json();
    
    // Ensure snack object always exists with proper structure
    if (!data.meals?.snack) {
      data.meals = {
        ...data.meals,
        snack: {
          main: [],
          sidedish: []
        }
      };
    }
    
    setCurrentMeals(data.meals);
    // Pre-populate the input fields with current data
    setMealInputs({
      breakfast_main: (data.meals?.breakfast?.main || []).join(", "),
      breakfast_sidedish: (data.meals?.breakfast?.sidedish || []).join(", "),
      lunch_monday_main: (data.meals?.lunch?.monday_main || []).join(", "),
      lunch_tuesday_main: (data.meals?.lunch?.tuesday_main || []).join(", "),
      lunch_wednesday_main: (data.meals?.lunch?.wednesday_main || []).join(", "),
      lunch_thursday_main: (data.meals?.lunch?.thursday_main || []).join(", "),
      lunch_friday_main: (data.meals?.lunch?.friday_main || []).join(", "),
      lunch_saturday_main: (data.meals?.lunch?.saturday_main || []).join(", "),
      lunch_sunday_main: (data.meals?.lunch?.sunday_main || []).join(", "),
      lunch_second_main: (data.meals?.lunch?.second_main || []).join(", "),
      lunch_poriyal: (data.meals?.lunch?.poriyal || []).join(", "),
      dinner_main: (data.meals?.dinner?.main || []).join(", "),
      dinner_sidedish: (data.meals?.dinner?.sidedish || []).join(", "),
      snack_main: (data.meals?.snack?.main || []).join(", "),
      snack_sidedish: (data.meals?.snack?.sidedish || []).join(", "),
    });
  };



  const handleAddMealItem = async () => {
    if (!newMealItem.trim() || !selectedMealType || !selectedMealCategory) {
      alert("Please select meal type, category and enter items");
      return;
    }

    const itemsToAdd = newMealItem
      .split(",")
      .map(item => item.trim())
      .filter(item => item);

    if (!currentMeals) {
      alert("Meals not loaded yet");
      return;
    }

    let mealDataKey = "";

    // Build the API field name based on selection
    if (selectedMealType === "breakfast") {
      mealDataKey = `breakfast_${selectedMealCategory}`;
    } 
    else if (selectedMealType === "lunch") {
      if (selectedMealCategory === "main") {
        if (!selectedDay) {
          alert("Please select a day for lunch main");
          return;
        }
        mealDataKey = `lunch_${selectedDay}_main`;
      } else {
        mealDataKey = `lunch_${selectedMealCategory}`;
      }
    } 
    else if (selectedMealType === "dinner") {
      mealDataKey = `dinner_${selectedMealCategory}`;
    }
    else if (selectedMealType === "snack") {
      mealDataKey = `snack_${selectedMealCategory}`;
    }

    // Build mealData from form inputs (preserves any edits user made)
    const mealData = {
      breakfast_main: mealInputs.breakfast_main.split(",").map(item => item.trim()).filter(item => item),
      breakfast_sidedish: mealInputs.breakfast_sidedish.split(",").map(item => item.trim()).filter(item => item),
      lunch_monday_main: mealInputs.lunch_monday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_tuesday_main: mealInputs.lunch_tuesday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_wednesday_main: mealInputs.lunch_wednesday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_thursday_main: mealInputs.lunch_thursday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_friday_main: mealInputs.lunch_friday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_saturday_main: mealInputs.lunch_saturday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_sunday_main: mealInputs.lunch_sunday_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_second_main: mealInputs.lunch_second_main.split(",").map(item => item.trim()).filter(item => item),
      lunch_poriyal: mealInputs.lunch_poriyal.split(",").map(item => item.trim()).filter(item => item),
      dinner_main: mealInputs.dinner_main.split(",").map(item => item.trim()).filter(item => item),
      dinner_sidedish: mealInputs.dinner_sidedish.split(",").map(item => item.trim()).filter(item => item),
      snack_main: mealInputs.snack_main.split(",").map(item => item.trim()).filter(item => item),
      snack_sidedish: mealInputs.snack_sidedish.split(",").map(item => item.trim()).filter(item => item),
    };

    // Add new items to selected category
    itemsToAdd.forEach(item => {
      if (!mealData[mealDataKey].includes(item)) {
        mealData[mealDataKey].push(item);
      }
    });

    try {
      const response = await apiFetch("/update-meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealData)
      });

      const result = await response.json();
      
      // Ensure snack object exists in result
      if (!result.meals?.snack) {
        result.meals = {
          ...result.meals,
          snack: {
            main: [],
            sidedish: []
          }
        };
      }
      
      setCurrentMeals(result.meals);
      
      // Sync UI form inputs with updated backend data
      setMealInputs({
        breakfast_main: (result.meals?.breakfast?.main || []).join(", "),
        breakfast_sidedish: (result.meals?.breakfast?.sidedish || []).join(", "),
        lunch_monday_main: (result.meals?.lunch?.monday_main || []).join(", "),
        lunch_tuesday_main: (result.meals?.lunch?.tuesday_main || []).join(", "),
        lunch_wednesday_main: (result.meals?.lunch?.wednesday_main || []).join(", "),
        lunch_thursday_main: (result.meals?.lunch?.thursday_main || []).join(", "),
        lunch_friday_main: (result.meals?.lunch?.friday_main || []).join(", "),
        lunch_saturday_main: (result.meals?.lunch?.saturday_main || []).join(", "),
        lunch_sunday_main: (result.meals?.lunch?.sunday_main || []).join(", "),
        lunch_second_main: (result.meals?.lunch?.second_main || []).join(", "),
        lunch_poriyal: (result.meals?.lunch?.poriyal || []).join(", "),
        dinner_main: (result.meals?.dinner?.main || []).join(", "),
        dinner_sidedish: (result.meals?.dinner?.sidedish || []).join(", "),
        snack_main: (result.meals?.snack?.main || []).join(", "),
        snack_sidedish: (result.meals?.snack?.sidedish || []).join(", "),
      });

      setNewMealItem("");
      setSelectedDay("");
      setSelectedMealCategory("");

      const syncResponse = await apiFetch("/meals-sync-status");
      const syncData = await syncResponse.json();
      console.log("✅ Items added and synced at:", syncData.timestamp);

      alert("✅ " + result.message + "\n📊 Changes are ready for meal generation!");
    } catch (error) {
      alert(`❌ Error adding meal items: ${error.message}`);
    console.error("Error:", error);
  }
};

  const handleRemoveMealItem = async (mealType, category, itemName) => {
    try {
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
      
      // Verify synchronization
      const syncResponse = await apiFetch("/meals-sync-status");
      const syncData = await syncResponse.json();
      console.log("✅ Item removed and synced at:", syncData.timestamp);
    } catch (error) {
      alert(`❌ Error removing meal item: ${error.message}`);
      console.error("Error:", error);
    }
  };

  // Generate Meal Plan Component
  const handleGenerateMealPlan = async () => {
    try {
      // Verify latest data before generating meal plan
      const syncResponse = await apiFetch("/meals-sync-status");
      const syncStatus = await syncResponse.json();
      console.log("✅ Meal Sync Status:", syncStatus);

      const response = await apiFetch("/generate-meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          //"Authorization": basicAuth
        },
        body: JSON.stringify({
          breakfast: true,
          lunch: true,
          dinner: true,
          snack: true
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setMealPlan(data);
      console.log("✅ Meal plan generated with latest data at:", new Date().toLocaleTimeString());
    } catch (error) {
      alert(`❌ Error generating meal plan: ${error.message}`);
      console.error("Error:", error);
    }
  };


  // Download Meal Plan Component as PDF
  const handleDownloadMealPlanPDF = () => {

  if (!mealPlan || !mealPlan.weekly_plan) {
    alert("Please generate a meal plan first");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("FitMeal South", 20, 20);

  doc.setFontSize(12);
  doc.text("Weekly Meal Plan", 20, 30);

  doc.setFontSize(10);
  const today = new Date().toLocaleDateString();
  doc.text(`Generated on: ${today}`, 20, 38);

  let y = 50;
  const pageHeight = doc.internal.pageSize.height;

  mealPlan.weekly_plan.forEach((day) => {

    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text(`${day.day} - ${day.date}`, 20, y);
    y += 8;

    doc.setFont(undefined, "normal");

    if (day.day_main) {
      doc.text(`${day.day} Main: ${day.day_main}`, 25, y);
      y += 6;
    }

    if (day.breakfast && day.breakfast.main) {
      const breakfastSidedish = day.breakfast.sidedish || "";
      doc.text(`Breakfast: ${day.breakfast.main} + ${breakfastSidedish}`, 25, y);
      y += 6;
    }

    if (day.lunch && day.lunch.day_main) {
      const lunchSecond = day.lunch.second_main || "";
      const lunchPoriyal = day.lunch.poriyal || "";
      doc.text(`Lunch: ${day.lunch.day_main} + ${lunchSecond} + ${lunchPoriyal}`, 25, y);
      y += 6;
    }

    if (day.dinner && day.dinner.main) {
      const dinnerSidedish = day.dinner.sidedish || "";
      doc.text(`Dinner: ${day.dinner.main} + ${dinnerSidedish}`, 25, y);
      y += 6;
    }

    y += 6;
  });

  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Generated from FitMeal South Planner", 20, pageHeight - 10);

  doc.save(`meal-plan-${new Date().toISOString().split("T")[0]}.pdf`);
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
  width: "50%",              // reduce width so centering is visible
  margin: "20px auto",       // centers the table horizontally
  border: "1px solid #ddd",
};

  const thStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "12px",
    textAlign: "center",
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

  // eslint-disable-next-line no-unused-vars
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
        <div style={{ backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "90vh", padding: "40px 20px" }}>
          <div className="container">
            {/* Page Title */}
            <div style={{ textAlign: "center", marginBottom: "50px", paddingTop: "20px" }}>
              <h1 style={{ color: "white", fontSize: "48px", fontWeight: "bold", textShadow: "2px 2px 8px rgba(0,0,0,0.3)", marginBottom: "10px" }}>
                🍽️ Healthy Meal Planner
              </h1>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", fontStyle: "italic" }}>
                Plan your meals, manage groceries, and stay healthy
              </p>
            </div>

            {/* Groceries Section */}
            <div style={{ marginBottom: "40px", backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "32px", marginRight: "15px" }}>🛒</span>
                <h2 style={{ margin: 0, color: "#2d3436", fontSize: "32px" }}>Groceries Management</h2>
              </div>
              <p style={{ color: "#636e72", fontSize: "16px", marginBottom: "20px" }}>
                Manage your grocery list, select items, and generate shopping lists
              </p>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <button
                    onClick={() => { setCurrentPage("updateGroceries"); handleFetchCurrentGroceries(); }}
                    className="btn btn-primary w-100 py-3"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    ✏️ Update Groceries
                  </button>
                </div>
                <div className="col-12 col-md-6">
                  <button
                    onClick={() => { setCurrentPage("groceries"); handleFetchGroceries(); }}
                    className="btn btn-success w-100 py-3"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    📋 Generate Groceries
                  </button>
                </div>
              </div>
            </div>

            {/* Meals Section */}
            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "32px", marginRight: "15px" }}>🍴</span>
                <h2 style={{ margin: 0, color: "#2d3436", fontSize: "32px" }}>Meal Planning</h2>
              </div>
              <p style={{ color: "#636e72", fontSize: "16px", marginBottom: "20px" }}>
                Create, customize, and generate your weekly meal plans
              </p>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <button
                    onClick={() => { setCurrentPage("inputJson"); handleFetchCurrentMeals(); }}
                    className="btn btn-warning w-100 py-3"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    ✏️ Update Meals
                  </button>
                </div>
                <div className="col-12 col-md-6">
                  <button
                    onClick={() => setCurrentPage("mealPlan")}
                    className="btn btn-danger w-100 py-3"
                    style={{ fontSize: "16px", fontWeight: "600" }}
                  >
                    📅 Generate Meals
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Groceries List Page */}
      {currentPage === "groceries" && (
        <div style={{ backgroundImage: "linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(139,195,74,0.1) 100%)", minHeight: "100vh", padding: "20px" }}>
          <div className="container">
            <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>← Back to Home</button>
            <h2 style={{ color: "#2d3436", textShadow: "1px 1px 2px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
              🛒 Select Groceries to Buy
            </h2>
          
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
        </div>
      )}

      {/* Input JSON Data Page */}
      {currentPage === "inputJson" && (
        <div style={{ backgroundImage: "linear-gradient(135deg, rgba(255,193,7,0.1) 0%, rgba(255,165,0,0.1) 100%)", minHeight: "100vh", padding: "20px" }}>
          <div className="container">
            <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>← Back to Home</button>
            <h2 style={{ color: "#2d3436", textShadow: "1px 1px 2px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
              🍽️ Update Meal Data
            </h2>

          <button 
            onClick={handleDownloadMealPayload} 
            style={{ ...buttonStyle, backgroundColor: "#2196F3", marginBottom: "20px" }}
          >
            ⬇️ Download Latest Payload (JSON)
          </button>

          {/* Display Current Meals by Type and Category */}
          {currentMeals && (
            <div style={{ marginBottom: "30px", backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "4px", textAlign: "center" }}>
              <h3>Current Meals in JSON</h3>

              {/* BREAKFAST */}
              {currentMeals.breakfast && (
                <div className="meal-section-breakfast" style={{ marginBottom: "20px" }}>
                  <h4 className="meal-category-header" style={{ marginTop: 0, textAlign: "center"}}>☀️ Breakfast</h4>
                  
                  {/* Main Dishes */}
                  <div className="meals-display-container" style={{ marginBottom: "15px",  textAlign: "center" }}>
                    <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Main Dishes</h5>
                    <div className="meal-table-wrapper">
                      <table className="meal-category-table">
                        <thead>
                          <tr>
                            <th style={thStyle}>Item</th>
                            <th style={thStyle}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMeals.breakfast.main && currentMeals.breakfast.main.map((item) => (
                            <tr key={`breakfast-main-${item}`}>
                              <td style={tdStyle}>{item}</td>
                              <td style={tdStyle}>
                                <button 
                                  className="meal-remove-btn"
                                  onClick={() => handleRemoveMealItem("breakfast", "main", item)}
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

                  {/* Side Dishes */}
                  {currentMeals.breakfast?.sidedish?.length > 0 && (
                    <div className="meals-display-container">
                      <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Side Dishes</h5>
                      <div className="meal-table-wrapper">
                        <table className="meal-category-table">
                          <thead>
                            <tr>
                              <th style={thStyle}>Item</th>
                              <th style={thStyle}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentMeals.breakfast.sidedish.map((item) => (
                              <tr key={`breakfast-sidedish-${item}`}>
                                <td style={tdStyle}>{item}</td>
                                <td style={tdStyle}>
                                  <button 
                                    className="meal-remove-btn"
                                    onClick={() => handleRemoveMealItem("breakfast", "sidedish", item)}
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
                  )}
                </div>
              )}

              {/* LUNCH */}
              {currentMeals.lunch && (
                <div className="meal-section-lunch" style={{ marginBottom: "20px" }}>
                  <h4 className="meal-category-header" style={{ marginTop: 0 }}>🥗 Lunch</h4>
                  
                  {/* Day-Specific Mains */}
                  <div className="meals-display-container" style={{ marginBottom: "15px" }}>
                    <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Day-Specific Mains</h5>
                    {["monday_main", "tuesday_main", "wednesday_main", "thursday_main", "friday_main", "saturday_main", "sunday_main"].map((day) => (
                      currentMeals.lunch[day]?.length > 0 && (
                        <div key={`lunch-${day}`} style={{ marginBottom: "10px" }}>
                          <h6 className="day-category-label" style={{ marginBottom: "5px", textTransform: "capitalize" }}>{day.replace("_main", "").charAt(0).toUpperCase() + day.replace("_main", "").slice(1)}</h6>
                          <div className="meal-table-wrapper">
                            <table className="meal-category-table">
                              <thead>
                                <tr>
                                  <th style={thStyle}>Item</th>
                                  <th style={thStyle}>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentMeals.lunch[day].map((item) => (
                                  <tr key={`lunch-${day}-${item}`}>
                                    <td style={tdStyle}>{item}</td>
                                    <td style={tdStyle}>
                                      <button 
                                        className="meal-remove-btn"
                                        onClick={() => handleRemoveMealItem("lunch", day, item)}
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
                      )
                    ))}
                  </div>

                  {/* Second Main */}
                  {currentMeals.lunch?.second_main?.length > 0 && (
                    <div className="meals-display-container" style={{ marginBottom: "15px" }}>
                      <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Second Main</h5>
                      <div className="meal-table-wrapper">
                        <table className="meal-category-table">
                          <thead>
                            <tr>
                              <th style={thStyle}>Item</th>
                              <th style={thStyle}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentMeals.lunch.second_main.map((item) => (
                              <tr key={`lunch-second_main-${item}`}>
                                <td style={tdStyle}>{item}</td>
                                <td style={tdStyle}>
                                  <button 
                                    className="meal-remove-btn"
                                    onClick={() => handleRemoveMealItem("lunch", "second_main", item)}
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
                  )}

                  {/* Poriyal */}
                  {currentMeals.lunch?.poriyal?.length > 0 && (
                    <div className="meals-display-container">
                      <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Poriyal</h5>
                      <div className="meal-table-wrapper">
                        <table className="meal-category-table">
                          <thead>
                            <tr>
                              <th style={thStyle}>Item</th>
                              <th style={thStyle}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentMeals.lunch.poriyal.map((item) => (
                              <tr key={`lunch-poriyal-${item}`}>
                                <td style={tdStyle}>{item}</td>
                                <td style={tdStyle}>
                                  <button 
                                    className="meal-remove-btn"
                                    onClick={() => handleRemoveMealItem("lunch", "poriyal", item)}
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
                  )}
                </div>
              )}

              {/* DINNER */}
              {currentMeals.dinner && (
                <div className="meal-section-dinner" style={{ marginBottom: "20px" }}>
                  <h4 className="meal-category-header" style={{ marginTop: 0 }}>🌙 Dinner</h4>
                  
                  {/* Main Dishes */}
                  <div className="meals-display-container" style={{ marginBottom: "15px" }}>
                    <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Main Dishes</h5>
                    <div className="meal-table-wrapper">
                      <table className="meal-category-table">
                        <thead>
                          <tr>
                            <th style={thStyle}>Item</th>
                            <th style={thStyle}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMeals.dinner.main && currentMeals.dinner.main.map((item) => (
                            <tr key={`dinner-main-${item}`}>
                              <td style={tdStyle}>{item}</td>
                              <td style={tdStyle}>
                                <button 
                                  className="meal-remove-btn"
                                  onClick={() => handleRemoveMealItem("dinner", "main", item)}
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

                  {/* Side Dishes */}
                  {currentMeals.dinner?.sidedish?.length > 0 && (
                    <div className="meals-display-container">
                      <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Side Dishes</h5>
                      <div className="meal-table-wrapper">
                        <table className="meal-category-table">
                          <thead>
                            <tr>
                              <th style={thStyle}>Item</th>
                              <th style={thStyle}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentMeals.dinner.sidedish.map((item) => (
                              <tr key={`dinner-sidedish-${item}`}>
                                <td style={tdStyle}>{item}</td>
                                <td style={tdStyle}>
                                  <button 
                                    className="meal-remove-btn"
                                    onClick={() => handleRemoveMealItem("dinner", "sidedish", item)}
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
                  )}
                </div>
              )}

              {/* SNACK */}
              {currentMeals && (
                <div className="meal-section-snack" style={{ marginBottom: "20px" }}>
                  <h4 className="meal-category-header" style={{ marginTop: 0 }}>🥜 Snack</h4>
                  
                  {/* Main Items */}
                  <div className="meals-display-container" style={{ marginBottom: "15px" }}>
                    <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Main Items</h5>
                    <div className="meal-table-wrapper">
                      <table className="meal-category-table">
                        <thead>
                          <tr>
                            <th style={thStyle}>Item</th>
                            <th style={thStyle}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentMeals.snack?.main && currentMeals.snack.main.length > 0 ? (
                            currentMeals.snack.main.map((item) => (
                              <tr key={`snack-main-${item}`}>
                                <td style={tdStyle}>{item}</td>
                                <td style={tdStyle}>
                                  <button 
                                    className="meal-remove-btn"
                                    onClick={() => handleRemoveMealItem("snack", "main", item)}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" style={{ ...tdStyle, textAlign: "center", fontStyle: "italic", color: "#999" }}>
                                No items added yet. Add snack items to get started!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Accompaniments */}
                  {currentMeals.snack?.sidedish?.length > 0 && (
                    <div className="meals-display-container">
                      <h5 className="meal-item-title" style={{ marginBottom: "10px" }}>Accompaniments</h5>
                      <div className="meal-table-wrapper">
                        <table className="meal-category-table">
                          <thead>
                            <tr>
                              <th style={thStyle}>Item</th>
                              <th style={thStyle}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentMeals.snack.sidedish.map((item) => (
                              <tr key={`snack-sidedish-${item}`}>
                                <td style={tdStyle}>{item}</td>
                                <td style={tdStyle}>
                                  <button 
                                    className="meal-remove-btn"
                                    onClick={() => handleRemoveMealItem("snack", "sidedish", item)}
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
                  )}
                </div>
              )}
            </div>
          )}

          {/* Add New Meal Items */}
<div style={{ backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "4px" }}>
  <h3>Add New Meal Items</h3>

  {/* Meal Type */}
  <div style={formGroupStyle}>
    <label>Select Meal Type:</label>
    <select 
      value={selectedMealType} 
      onChange={(e) => {
        setSelectedMealType(e.target.value);
        setSelectedMealCategory("");
        setSelectedDay("");
      }}
      style={{ ...inputStyle, marginTop: "5px" }}
    >
      <option value="">-- Select a meal type --</option>
      <option value="breakfast">Breakfast</option>
      <option value="lunch">Lunch</option>
      <option value="dinner">Dinner</option>
      <option value="snack">Snack</option>
    </select>
  </div>

  {/* Category */}
  <div style={formGroupStyle}>
    <label>Select Category:</label>
    <select 
      value={selectedMealCategory} 
      onChange={(e) => {
        setSelectedMealCategory(e.target.value);
        setSelectedDay("");
      }}
      style={{ ...inputStyle, marginTop: "5px" }}
    >
      <option value="">-- Select category --</option>

      {selectedMealType === "breakfast" && (
        <>
          <option value="main">Main</option>
          <option value="sidedish">Side Dish</option>
        </>
      )}

      {selectedMealType === "lunch" && (
        <>
          <option value="main">Main</option>
          <option value="second_main">Second Main</option>
          <option value="poriyal">Poriyal</option>
        </>
      )}

      {selectedMealType === "dinner" && (
        <>
          <option value="main">Main</option>
          <option value="sidedish">Side Dish</option>
        </>
      )}

      {selectedMealType === "snack" && (
        <>
          <option value="main">Main Items</option>
          <option value="sidedish">Accompaniments</option>
        </>
      )}
    </select>
  </div>

  {/* Day Selector (only for lunch main) */}
  {selectedMealType === "lunch" && selectedMealCategory === "main" && (
    <div style={formGroupStyle}>
      <label>Select Day:</label>
      <select
        value={selectedDay}
        onChange={(e) => setSelectedDay(e.target.value)}
        style={{ ...inputStyle, marginTop: "5px" }}
      >
        <option value="">-- Select day --</option>
        <option value="monday">Monday</option>
        <option value="tuesday">Tuesday</option>
        <option value="wednesday">Wednesday</option>
        <option value="thursday">Thursday</option>
        <option value="friday">Friday</option>
        <option value="saturday">Saturday</option>
        <option value="sunday">Sunday</option>
      </select>
    </div>
  )}

  {/* Input */}
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

  {/* Button */}
  <button 
  onClick={handleAddMealItem}
  style={buttonStyle}
  disabled={
    !selectedMealType ||
    !selectedMealCategory ||
    (selectedMealType === "lunch" && selectedMealCategory === "main" && !selectedDay)
  }
>
  Add Meal Items
</button>
</div>
          </div>
        </div>
      )}

      {/* Update Groceries List Page */}
      {currentPage === "updateGroceries" && (
        <div style={{ backgroundImage: "linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(139,195,74,0.1) 100%)", minHeight: "100vh", padding: "20px" }}>
          <div className="container">
            <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>← Back to Home</button>
            <h2 style={{ color: "#2d3436", textShadow: "1px 1px 2px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
              ✏️ Update Groceries List
            </h2>

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
        </div>
      )}

      {/* Generate Meal Plan Page */}
      {currentPage === "mealPlan" && (
        <MealPage 
          mealPlan={mealPlan}
          onBack={() => setCurrentPage("home")}
          onDownloadPDF={handleDownloadMealPlanPDF}
        />
      )}
      
      {/* Show Generate Button when no meal plan exists */}
      {currentPage === "mealPlan" && !mealPlan && (
        <div style={{ backgroundImage: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "100vh", padding: "40px 20px", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: "600px" }}>
            <button onClick={() => setCurrentPage("home")} style={backButtonStyle}>← Back to Home</button>
            <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
              <h2 style={{ color: "#2d3436", marginBottom: "20px", fontSize: "36px" }}>📅 Generate Your Meal Plan</h2>
              <p style={{ color: "#636e72", fontSize: "16px", marginBottom: "30px" }}>
                Create a personalized 7-day meal plan based on your meal preferences
              </p>
              <button onClick={handleGenerateMealPlan} style={{ ...buttonStyle, width: "100%", padding: "18px 30px", fontSize: "18px" }}>
                🍽️ Generate 7-Day Meal Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;