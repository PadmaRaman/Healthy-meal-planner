  const handleMealInputChange = (field, value) => 
    {
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

    const response = await fetch(`${API_BASE_URL}/update-meals`, {
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