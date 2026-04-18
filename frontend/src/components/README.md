# Components Directory

## MealPage Component

### Overview
The `MealPage` component is a beautifully designed React component that displays healthy meal plans with:
- 🌅 Breakfast section with morning meal options
- ☀️ Lunch section with day-specific lunch plans
- 🌙 Dinner section with evening meals

### Usage

```jsx
import MealPage from './components/MealPage';

<MealPage 
  mealPlan={mealPlanData}
  onBack={() => setCurrentPage("home")}
  onDownloadPDF={handleDownloadPDF}
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `mealPlan` | Object | Meal plan data containing weekly_plan, week_start, week_end |
| `onBack` | Function | Callback function when back button is clicked |
| `onDownloadPDF` | Function | Callback function for PDF download |

### Expected Data Structure

```javascript
{
  weekly_plan: [
    {
      day: "Monday",
      date: "2024-04-01",
      breakfast: {
        main: "Idli",
        sidedish: "Sambar"
      },
      lunch: {
        day_main: "Rice",
        second_main: "Rasam",
        poriyal: "Carrot Poriyal"
      },
      dinner: {
        main: "Roti",
        sidedish: "Vegetable Curry"
      }
    },
    // ... more days
  ],
  week_start: "2024-04-01",
  week_end: "2024-04-07"
}
```

### Files Included

1. **MealPage.js** - Main component
2. **MealPage.css** - Default styling
3. **MealPageThemes.css** - Alternative theme styles

### Features

#### Visual Design
- 🎨 Color-coded meal sections (Breakfast: Orange, Lunch: Green, Dinner: Blue)
- 📸 High-quality background images from Unsplash
- 🌓 Shaded overlays for text readability
- ✨ Smooth hover effects and transitions

#### Responsive Design
- 📱 Mobile optimized (< 480px)
- 📱 Tablet optimized (480px - 768px)
- 💻 Desktop optimized (> 768px)

#### Accessibility
- High contrast text
- Readable font sizes
- Semantic HTML structure
- ARIA-friendly design

### Customization

#### Changing Image URLs

Edit the `mealImages` object in `MealPage.js`:

```javascript
const mealImages = {
  breakfast: 'https://your-image-url-breakfast.jpg',
  lunch: 'https://your-image-url-lunch.jpg',
  dinner: 'https://your-image-url-dinner.jpg'
};
```

#### Applying Alternative Themes

Import the themes CSS:

```jsx
import './components/MealPageThemes.css';

// In your component:
<div className="meal-page-container dark-theme">
  {/* Content */}
</div>
```

Available themes:
- `dark-theme` - Dark mode
- `premium-theme` - Premium look
- `vibrant-theme` - Colorful gradient
- `minimal-theme` - Minimalist design
- `spring-theme` - Light green/blue tones
- `summer-theme` - Warm orange/yellow tones
- `autumn-theme` - Golden orange tones
- `winter-theme` - Cool blue/purple tones
- `high-contrast` - Accessibility enhanced
- `glass` - Glass morphism effect
- `neumorphic` - Neumorphic design
- `modern-glass` - Modern glassmorphism
- `animated` - Animated card appearance
- `compact` - Space-efficient layout
- `wide` - Full-width layout

### Styling Details

#### CSS Classes

- `.meal-page-container` - Main container
- `.meal-page-header` - Header section
- `.meal-card` - Individual meal card
- `.meal-background` - Background image area
- `.meal-overlay` - Dark overlay
- `.meal-content` - Text content on background
- `.meal-details` - Meal details section
- `.meal-list` - List of meals
- `.meal-item` - Individual meal item
- `.day-label` - Day of week label
- `.meal-text` - Meal description text

#### Color Scheme

| Element | Color | Hex Code |
|---------|-------|----------|
| Breakfast | Orange | #FF8C42 |
| Lunch | Green | #4CAF50 |
| Dinner | Blue | #2196F3 |
| Primary Button | Blue | #2196F3 |
| Download Button | Purple | #667eea |
| Text | Dark Gray | #2d3436 |
| Secondary Text | Medium Gray | #636e72 |

### Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

### Performance Notes

- Images are optimized (800px width, quality=80)
- Uses hardware-accelerated CSS transforms
- No heavy JavaScript animations
- Lazy loading can be implemented

### Common Issues

#### Images not loading
- Check internet connection
- Verify image URLs in `mealImages` object
- Check browser console for CORS errors

#### Text not readable
- Ensure overlay opacity is properly set
- Check image darkness/lightness
- Adjust `rgba()` values in CSS

#### Responsive issues
- Test with browser dev tools
- Check viewport meta tag in HTML
- Verify media queries are correct

### Examples

#### Basic Usage
```jsx
<MealPage 
  mealPlan={data}
  onBack={() => goHome()}
  onDownloadPDF={() => downloadPDF()}
/>
```

#### With Dark Theme
```jsx
<div className="meal-page-container dark-theme">
  <MealPage 
    mealPlan={data}
    onBack={() => goHome()}
    onDownloadPDF={() => downloadPDF()}
  />
</div>
```

#### With Loading State
```jsx
{mealPlan ? (
  <MealPage 
    mealPlan={mealPlan}
    onBack={() => goHome()}
    onDownloadPDF={() => downloadPDF()}
  />
) : (
  <LoadingSpinner />
)}
```

### Future Enhancements

- [ ] Add meal filtering options
- [ ] Implement recipe modals
- [ ] Add nutritional information
- [ ] Integrate nutritional charts
- [ ] Add meal swap functionality
- [ ] Implement favorites/bookmarking
- [ ] Add social sharing options
- [ ] Integrate with grocery list
- [ ] Add meal prep notes
- [ ] Implement voice-over for accessibility

### Version History

**v1.0** - Initial release
- Beautiful meal card design
- Background images with overlays
- Responsive layout
- Multiple theme options
- PDF download functionality

---

For more information, see [MEAL_PAGE_ENHANCEMENT.md](../MEAL_PAGE_ENHANCEMENT.md)
