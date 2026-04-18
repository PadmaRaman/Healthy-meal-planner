import React from 'react';
import './MealPage.css';

const MealPage = ({ mealPlan, onBack, onDownloadPDF }) => {
  // Image URLs from free sources with meals theme
  const mealImages = {
    breakfast: 'https://images.unsplash.com/photo-1588000310519-40419e37fe51?w=800&q=80',
    lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    dinner: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80',
    snack: 'https://images.unsplash.com/photo-1599599810694-b5ac4dd19453?w=800&q=80'
  };

  return (
    <div className="meal-page-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>

      <div className="meal-page-header">
        <h1>🍽️ Your Healthy Meal Plan</h1>
        <p className="header-subtitle">Delicious & Nutritious Meals for You</p>
      </div>

      {mealPlan && (
        <>
          <div className="download-section">
            <button onClick={onDownloadPDF} className="download-btn">
              📄 Download Meal Plan as PDF
            </button>
          </div>

          {/* Breakfast Card */}
          <div className="meal-card breakfast-card">
            <div 
              className="meal-background" 
              style={{backgroundImage: `url('${mealImages.breakfast}')`}}
            >
              <div className="meal-overlay"></div>
              <div className="meal-content">
                <h2>🌅 Breakfast</h2>
                <div className="meal-type-description">
                  Start Your Day with Health & Energy
                </div>
              </div>
            </div>
            
            <div className="meal-details">
              <div className="meal-list">
                {mealPlan.weekly_plan && mealPlan.weekly_plan.map((day, idx) => (
                  day.breakfast && (
                    <div key={idx} className="meal-item">
                      <span className="day-label">{day.day}</span>
                      <span className="meal-text">
                        {day.breakfast.main} + {day.breakfast.sidedish}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Lunch Card */}
          <div className="meal-card lunch-card">
            <div 
              className="meal-background" 
              style={{backgroundImage: `url('${mealImages.lunch}')`}}
            >
              <div className="meal-overlay"></div>
              <div className="meal-content">
                <h2>☀️ Lunch</h2>
                <div className="meal-type-description">
                  Fuel Your Afternoon with Variety & Taste
                </div>
              </div>
            </div>
            
            <div className="meal-details">
              <div className="meal-list">
                {mealPlan.weekly_plan && mealPlan.weekly_plan.map((day, idx) => (
                  day.lunch && (
                    <div key={idx} className="meal-item">
                      <span className="day-label">{day.day}</span>
                      <span className="meal-text">
                        {day.lunch.day_main} + {day.lunch.second_main} + {day.lunch.poriyal}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Dinner Card */}
          <div className="meal-card dinner-card">
            <div 
              className="meal-background" 
              style={{backgroundImage: `url('${mealImages.dinner}')`}}
            >
              <div className="meal-overlay"></div>
              <div className="meal-content">
                <h2>🌙 Dinner</h2>
                <div className="meal-type-description">
                  Complete Your Day with Light & Nourishing Meals
                </div>
              </div>
            </div>
            
            <div className="meal-details">
              <div className="meal-list">
                {mealPlan.weekly_plan && mealPlan.weekly_plan.map((day, idx) => (
                  day.dinner && (
                    <div key={idx} className="meal-item">
                      <span className="day-label">{day.day}</span>
                      <span className="meal-text">
                        {day.dinner.main} + {day.dinner.sidedish}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Snack Card */}
          <div className="meal-card snack-card">
            <div 
              className="meal-background" 
              style={{backgroundImage: `url('${mealImages.snack}')`}}
            >
              <div className="meal-overlay"></div>
              <div className="meal-content">
                <h2>🥜 Snack</h2>
                <div className="meal-type-description">
                  Energize Your Day with Healthy Bites
                </div>
              </div>
            </div>
            
            <div className="meal-details">
              <div className="meal-list">
                {mealPlan.weekly_plan && mealPlan.weekly_plan.map((day, idx) => (
                  day.snack && (
                    <div key={idx} className="meal-item">
                      <span className="day-label">{day.day}</span>
                      <span className="meal-text">
                        {day.snack.main} + {day.snack.sidedish}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="weekly-summary">
            <h3>📅 Weekly Overview</h3>
            <p className="week-range">
              Week: {mealPlan.week_start} to {mealPlan.week_end}
            </p>
          </div>
        </>
      )}

      {!mealPlan && (
        <div className="no-data-message">
          <p>Please generate a meal plan to view details</p>
        </div>
      )}
    </div>
  );
};

export default MealPage;
