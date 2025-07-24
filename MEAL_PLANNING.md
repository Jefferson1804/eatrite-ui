# Meal Planning Feature

## Overview

The meal planning feature allows users to create comprehensive meal plans for any time frame, with AI-powered recipe generation and calendar-based meal management.

## Features

### 1. Meal Plan Creation
- Create meal plans for different time frames (1 week, 2 weeks, 1 month)
- Add custom names and descriptions to meal plans
- Multiple active meal plans supported

### 2. Calendar View
- Interactive calendar showing planned meals
- Visual indicators for dates with meals
- Click on any date to view and manage meals
- Add meals directly from calendar view

### 3. AI-Powered Meal Generation
- Generate complete meal plans using AI
- AI considers user's dietary preferences, allergies, and health goals
- Automatically saves generated recipes to user's collection
- Generates breakfast, lunch, and dinner for each day

### 4. Recipe Integration
- Save recipes from the recipe generation page
- Use saved recipes in meal planning
- View recipe details including cooking time and meal type
- Quick access to saved recipes in meal planning interface

### 5. Meal Management
- Add meals to specific dates and times
- Choose from saved recipes or create custom meals
- Set serving sizes and add notes
- Remove meals from plans
- Track meal completion status

## User Profile Integration

The meal planning system integrates with user profiles to provide personalized meal suggestions:

### Dietary Preferences
- Vegetarian, vegan, gluten-free, dairy-free
- Keto, paleo, mediterranean, low-carb
- Custom dietary restrictions

### Allergies & Intolerances
- Track food allergies and intolerances
- AI avoids ingredients that cause reactions

### Health Goals
- Weight loss, weight gain, muscle gain
- Maintenance, energy improvement
- Better sleep, stress reduction
- Heart health, diabetes management

## Database Schema

### Meal Plans Table
```sql
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Meal Plan Items Table
```sql
CREATE TABLE meal_plan_items (
    id UUID PRIMARY KEY,
    meal_plan_id UUID REFERENCES meal_plans(id),
    recipe_id UUID REFERENCES recipes(id),
    meal_type meal_type NOT NULL,
    planned_date DATE NOT NULL,
    servings INTEGER DEFAULT 1,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage

### Creating a Meal Plan
1. Navigate to `/recipes/meal-plan`
2. Click "Create Plan"
3. Enter plan name and description
4. Select time frame (1 week, 2 weeks, 1 month)
5. Click "Create Plan"

### Adding Meals
1. Select a meal plan from the sidebar
2. Click on a date in the calendar
3. Click "Add Meal"
4. Choose meal type (breakfast, lunch, dinner, snack, dessert)
5. Optionally select a saved recipe
6. Set servings and add notes
7. Click "Add Meal"

### AI Generation
1. Select a meal plan
2. Click "AI Generate"
3. AI will generate meals for each day based on user preferences
4. Generated recipes are automatically saved to user's collection

### Saving Recipes
1. Generate a recipe on the recipes page
2. Click "Save" button on the recipe result
3. Recipe is saved to user's collection
4. Saved recipes appear in meal planning interface

## Technical Implementation

### AI Integration
- Uses MockAIService for development
- Can be configured to use OpenAI API for production
- Generates recipes based on user preferences and dietary restrictions
- Automatically saves generated recipes to database

### Calendar Integration
- Uses react-day-picker for calendar functionality
- Custom modifiers for meal indicators
- Responsive design for mobile and desktop

### State Management
- React hooks for local state management
- Real-time updates with Supabase
- Optimistic UI updates for better UX

## Future Enhancements

### Planned Features
- Shopping list generation from meal plans
- Nutritional tracking and analysis
- Meal plan templates and sharing
- Recipe recommendations based on available ingredients
- Integration with grocery delivery services

### Technical Improvements
- Real-time collaboration on meal plans
- Advanced AI with image recognition
- Mobile app with offline support
- Integration with fitness tracking apps 