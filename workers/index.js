// Data storage (in production, use Cloudflare KV or D1 Database)
let MEALS = {
  breakfast: { main: ["Idli", "Dosa", "Upma"], sidedish: ["Sambar", "Chutney"] },
  lunch: { main: ["Rice", "Biryani"], sidedish: ["Dal", "Vegetable curry"] },
  dinner: { main: ["Roti", "Chapathi"], sidedish: ["Sambar", "Pickle"] },
  snack: { main: ["Bonda", "Pakora"], sidedish: ["Chutney", "Pickle"] }
};

let GROCERIES = {
  "Pooja Items": ["Flowers", "Incense", "Oil"],
  "Dhal Items": ["Chana Dal", "Moong Dal", "Urad Dal"],
  "Oil Items": ["Coconut Oil", "Sesame Oil"],
  "Millet Items": ["Bajra", "Ragi", "Jowar"],
  "Bathroom Items": ["Soap", "Shampoo", "Toothpaste"],
  "Sundal Items": ["Chick peas", "Black eyed peas"],
  "Flour Items": ["Rice flour", "Wheat flour"],
  "Masala Items": ["Turmeric", "Chili powder", "Cumin"],
  "Dry Fruits": ["Almonds", "Cashews", "Dates"],
  "Samba Pettai Items": ["Rice", "Wheat"],
  "Other Items": ["Sugar", "Salt", "Spices"]
};

// Basic Authentication
function checkAuth(request) {
  const authHeader = request.headers.get("Authorization");
  const token = request.env.AUTH_TOKEN || "demo-token";
  
  if (!authHeader || !authHeader.includes(token)) {
    return false;
  }
  return true;
}

// CORS headers
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

// Handle OPTIONS request
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

// Routes
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Public endpoints (no auth required)
    if (path === "/" && request.method === "GET") {
      return new Response(JSON.stringify({ message: "Healthy Meal Planner API" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    if (path === "/groceries" && request.method === "GET") {
      return new Response(JSON.stringify({ groceries: GROCERIES }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    if (path === "/meals" && request.method === "GET") {
      return new Response(JSON.stringify({ meals: MEALS }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    // Protected endpoints (auth required)
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    if (path === "/add-groceries" && request.method === "POST") {
      const body = await request.json();
      const { category, items } = body;

      if (!GROCERIES[category]) {
        GROCERIES[category] = [];
      }

      items.forEach(item => {
        if (!GROCERIES[category].includes(item)) {
          GROCERIES[category].push(item);
        }
      });

      return new Response(JSON.stringify({ message: "Items added", groceries: GROCERIES }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    if (path.startsWith("/remove-grocery/")) {
      const parts = path.split("/");
      const category = decodeURIComponent(parts[2]);
      const itemName = decodeURIComponent(parts[3]);

      if (GROCERIES[category]) {
        GROCERIES[category] = GROCERIES[category].filter(item => item !== itemName);
      }

      return new Response(JSON.stringify({ message: "Item removed", groceries: GROCERIES }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    if (path === "/update-meals" && request.method === "POST") {
      const body = await request.json();

      MEALS = {
        breakfast: {
          main: body.breakfast_main || [],
          sidedish: body.breakfast_sidedish || []
        },
        lunch: {
          main: body.lunch_main || [],
          sidedish: body.lunch_sidedish || []
        },
        dinner: {
          main: body.dinner_main || [],
          sidedish: body.dinner_sidedish || []
        },
        snack: {
          main: body.snack_main || [],
          sidedish: body.snack_sidedish || []
        }
      };

      return new Response(JSON.stringify({ message: "Meals updated", meals: MEALS }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    if (path === "/remove-meal-item" && request.method === "POST") {
      const body = await request.json();
      const { meal_type, category, item_name } = body;

      if (MEALS[meal_type] && MEALS[meal_type][category]) {
        MEALS[meal_type][category] = MEALS[meal_type][category].filter(item => item !== item_name);
      }

      return new Response(JSON.stringify({ message: "Meal item removed", meals: MEALS }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    if (path === "/generate-meal-plan" && request.method === "POST") {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const weeklyPlan = [];
      const today = new Date();

      days.forEach((day, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);
        const formattedDate = date.toISOString().split("T")[0];

        const randomBreakfastMain = MEALS.breakfast.main[Math.floor(Math.random() * MEALS.breakfast.main.length)];
        const randomBreakfastSide = MEALS.breakfast.sidedish[Math.floor(Math.random() * MEALS.breakfast.sidedish.length)];
        const randomLunchMain = MEALS.lunch.main[Math.floor(Math.random() * MEALS.lunch.main.length)];
        const randomLunchSide = MEALS.lunch.sidedish[Math.floor(Math.random() * MEALS.lunch.sidedish.length)];
        const randomDinnerMain = MEALS.dinner.main[Math.floor(Math.random() * MEALS.dinner.main.length)];
        const randomDinnerSide = MEALS.dinner.sidedish[Math.floor(Math.random() * MEALS.dinner.sidedish.length)];
        const randomSnackMain = MEALS.snack.main[Math.floor(Math.random() * MEALS.snack.main.length)];
        const randomSnackSide = MEALS.snack.sidedish[Math.floor(Math.random() * MEALS.snack.sidedish.length)];

        weeklyPlan.push({
          day,
          date: formattedDate,
          breakfast: { main: randomBreakfastMain, sidedish: randomBreakfastSide },
          lunch: { main: randomLunchMain, sidedish: randomLunchSide },
          dinner: { main: randomDinnerMain, sidedish: randomDinnerSide },
          snack: { main: randomSnackMain, sidedish: randomSnackSide }
        });
      });

      return new Response(JSON.stringify({ note: "Generated on " + new Date().toISOString(), weekly_plan: weeklyPlan }), {
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders() }
    });
  }
};
