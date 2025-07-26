-- EatRite Database Schema
-- This file contains all the database tables and relationships for the EatRite application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin', 'premium');
CREATE TYPE recipe_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'dessert');
CREATE TYPE ingredient_unit AS ENUM ('g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'clove', 'bunch', 'can', 'jar');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    dietary_preferences TEXT[], -- Array of dietary preferences (vegetarian, vegan, gluten-free, etc.)
    allergies TEXT[], -- Array of allergies
    goals TEXT[], -- Array of health goals (weight_loss, muscle_gain, maintenance, etc.)
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table for organizing recipes
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    calories_per_100g DECIMAL(6,2),
    protein_per_100g DECIMAL(5,2),
    carbs_per_100g DECIMAL(5,2),
    fat_per_100g DECIMAL(5,2),
    fiber_per_100g DECIMAL(5,2),
    sugar_per_100g DECIMAL(5,2),
    sodium_per_100g DECIMAL(6,2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
    servings INTEGER,
    difficulty recipe_difficulty DEFAULT 'medium',
    meal_type meal_type,
    cuisine_type TEXT,
    tags TEXT[],
    image_url TEXT,
    video_url TEXT,
    author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id),
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(8,3) NOT NULL,
    unit ingredient_unit NOT NULL,
    notes TEXT,
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, ingredient_id)
);

-- Recipe ratings table
CREATE TABLE IF NOT EXISTS recipe_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, user_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- Meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal plan items table
CREATE TABLE IF NOT EXISTS meal_plan_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    meal_type meal_type NOT NULL,
    planned_date DATE NOT NULL,
    servings INTEGER DEFAULT 1,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping list items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
    ingredient_name TEXT NOT NULL, -- Allow custom ingredients not in the ingredients table
    quantity DECIMAL(8,3) NOT NULL,
    unit ingredient_unit NOT NULL,
    is_purchased BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User nutrition goals table
CREATE TABLE IF NOT EXISTS user_nutrition_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    daily_calories INTEGER,
    daily_protein_g DECIMAL(6,2),
    daily_carbs_g DECIMAL(6,2),
    daily_fat_g DECIMAL(6,2),
    daily_fiber_g DECIMAL(5,2),
    daily_sugar_g DECIMAL(5,2),
    daily_sodium_mg DECIMAL(7,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, is_active) WHERE is_active = TRUE
);

-- User nutrition tracking table
CREATE TABLE IF NOT EXISTS user_nutrition_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_type meal_type,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    custom_meal_name TEXT,
    calories INTEGER,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    fiber_g DECIMAL(5,2),
    sugar_g DECIMAL(5,2),
    sodium_mg DECIMAL(7,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    meal_reminders BOOLEAN DEFAULT TRUE,
    shopping_reminders BOOLEAN DEFAULT TRUE,
    theme TEXT DEFAULT 'system', -- 'light', 'dark', 'system'
    language TEXT DEFAULT 'en',
    units TEXT DEFAULT 'metric', -- 'metric', 'imperial'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_author_id ON recipes(author_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category_id ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON recipes(is_public);
CREATE INDEX IF NOT EXISTS idx_recipes_rating_average ON recipes(rating_average);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe_id ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_user_id ON recipe_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_recipe_id ON user_favorites(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_planned_date ON meal_plan_items(planned_date);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_shopping_list_id ON shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_log_user_id ON user_nutrition_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_nutrition_log_date ON user_nutrition_log(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipe_ratings_updated_at BEFORE UPDATE ON recipe_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plan_items_updated_at BEFORE UPDATE ON meal_plan_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON shopping_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shopping_list_items_updated_at BEFORE UPDATE ON shopping_list_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_nutrition_goals_updated_at BEFORE UPDATE ON user_nutrition_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_nutrition_log_updated_at BEFORE UPDATE ON user_nutrition_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    
    -- Create default user settings
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nutrition_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes: public recipes are viewable by everyone, private recipes only by author
CREATE POLICY "Public recipes are viewable by everyone" ON recipes FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own recipes" ON recipes FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Users can insert own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = author_id);

-- Recipe ingredients: viewable with recipe, manageable by recipe author
CREATE POLICY "Recipe ingredients viewable with recipe" ON recipe_ingredients FOR SELECT USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND (is_public = true OR auth.uid() = author_id))
);
CREATE POLICY "Users can manage ingredients for own recipes" ON recipe_ingredients FOR ALL USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_ingredients.recipe_id AND auth.uid() = author_id)
);

-- Recipe ratings: viewable by everyone, manageable by authenticated users
CREATE POLICY "Recipe ratings are viewable by everyone" ON recipe_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ratings" ON recipe_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON recipe_ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON recipe_ratings FOR DELETE USING (auth.uid() = user_id);

-- User favorites: users can only see and manage their own favorites
CREATE POLICY "Users can view own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Meal plans: users can only see and manage their own meal plans
CREATE POLICY "Users can view own meal plans" ON meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal plans" ON meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal plans" ON meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal plans" ON meal_plans FOR DELETE USING (auth.uid() = user_id);

-- Meal plan items: users can only see and manage their own meal plan items
CREATE POLICY "Users can view own meal plan items" ON meal_plan_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meal_plan_items.meal_plan_id AND auth.uid() = user_id)
);
CREATE POLICY "Users can manage own meal plan items" ON meal_plan_items FOR ALL USING (
    EXISTS (SELECT 1 FROM meal_plans WHERE id = meal_plan_items.meal_plan_id AND auth.uid() = user_id)
);

-- Shopping lists: users can only see and manage their own shopping lists
CREATE POLICY "Users can view own shopping lists" ON shopping_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shopping lists" ON shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shopping lists" ON shopping_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shopping lists" ON shopping_lists FOR DELETE USING (auth.uid() = user_id);

-- Shopping list items: users can only see and manage their own shopping list items
CREATE POLICY "Users can view own shopping list items" ON shopping_list_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM shopping_lists WHERE id = shopping_list_items.shopping_list_id AND auth.uid() = user_id)
);
CREATE POLICY "Users can manage own shopping list items" ON shopping_list_items FOR ALL USING (
    EXISTS (SELECT 1 FROM shopping_lists WHERE id = shopping_list_items.shopping_list_id AND auth.uid() = user_id)
);

-- User nutrition goals: users can only see and manage their own nutrition goals
CREATE POLICY "Users can view own nutrition goals" ON user_nutrition_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition goals" ON user_nutrition_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition goals" ON user_nutrition_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition goals" ON user_nutrition_goals FOR DELETE USING (auth.uid() = user_id);

-- User nutrition log: users can only see and manage their own nutrition log
CREATE POLICY "Users can view own nutrition log" ON user_nutrition_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition log" ON user_nutrition_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition log" ON user_nutrition_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition log" ON user_nutrition_log FOR DELETE USING (auth.uid() = user_id);

-- Notifications: users can only see and manage their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- User settings: users can only see and manage their own settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Insert some default categories
INSERT INTO categories (name, description, icon, color) VALUES
('Breakfast', 'Morning meals and breakfast recipes', 'sunrise', '#FF6B6B'),
('Lunch', 'Midday meals and lunch recipes', 'sun', '#4ECDC4'),
('Dinner', 'Evening meals and dinner recipes', 'moon', '#45B7D1'),
('Snacks', 'Quick snacks and appetizers', 'coffee', '#96CEB4'),
('Desserts', 'Sweet treats and desserts', 'cake', '#FFEAA7'),
('Vegetarian', 'Vegetarian recipes', 'leaf', '#55A3FF'),
('Vegan', 'Vegan recipes', 'sprout', '#4CAF50'),
('Gluten-Free', 'Gluten-free recipes', 'shield', '#FF9800'),
('Quick & Easy', 'Quick and easy recipes', 'zap', '#9C27B0'),
('Healthy', 'Healthy and nutritious recipes', 'heart', '#E91E63')
ON CONFLICT (name) DO NOTHING;

-- Insert some common ingredients
INSERT INTO ingredients (name, description, category_id, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, is_verified) VALUES
('Chicken Breast', 'Lean chicken breast meat', (SELECT id FROM categories WHERE name = 'Protein'), 165, 31, 0, 3.6, 0, 0, 74, true),
('Brown Rice', 'Whole grain brown rice', (SELECT id FROM categories WHERE name = 'Grains'), 111, 2.6, 23, 0.9, 1.8, 0.4, 5, true),
('Broccoli', 'Fresh broccoli florets', (SELECT id FROM categories WHERE name = 'Vegetables'), 34, 2.8, 7, 0.4, 2.6, 1.5, 33, true),
('Olive Oil', 'Extra virgin olive oil', (SELECT id FROM categories WHERE name = 'Fats'), 884, 0, 0, 100, 0, 0, 2, true),
('Eggs', 'Fresh chicken eggs', (SELECT id FROM categories WHERE name = 'Protein'), 155, 13, 1.1, 11, 0, 1.1, 124, true)
ON CONFLICT (name) DO NOTHING; 