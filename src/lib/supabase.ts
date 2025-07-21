import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// --- Recipe TypeScript interface (minimal, adjust as needed) ---
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
  servings?: number;
  difficulty?: string;
  meal_type?: string;
  cuisine_type?: string;
  tags?: string[];
  image_url?: string;
  video_url?: string;
  author_id?: string;
  category_id?: string;
  is_public?: boolean;
  is_featured?: boolean;
  rating_average?: number;
  rating_count?: number;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
}

// --- CRUD helpers for 'recipes' table ---

/**
 * Fetch all public recipes (or those accessible to the user)
 */
export async function getRecipes() {
  const client = createClient();
  const { data, error } = await client.from('recipes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Recipe[];
}

/**
 * Fetch a single recipe by ID
 */
export async function getRecipeById(id: string) {
  const client = createClient();
  const { data, error } = await client.from('recipes').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Recipe;
}

/**
 * Create a new recipe (user must be authenticated and RLS must allow)
 */
export async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'rating_average' | 'rating_count'>) {
  const client = createClient();
  const { data, error } = await client.from('recipes').insert([recipe]).select().single();
  if (error) throw error;
  return data as Recipe;
}

/**
 * Update an existing recipe by ID
 */
export async function updateRecipe(id: string, updates: Partial<Recipe>) {
  const client = createClient();
  const { data, error } = await client.from('recipes').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Recipe;
}

/**
 * Delete a recipe by ID
 */
export async function deleteRecipe(id: string) {
  const client = createClient();
  const { error } = await client.from('recipes').delete().eq('id', id);
  if (error) throw error;
  return true;
} 