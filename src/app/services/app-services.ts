
import { createServerSupabaseClient } from '../../lib/supabase-server'

/**
 * Update a user's profile.
 * @param userId - The user's ID
 * @param profileData - Partial profile fields to update
 */
export async function updateUserProfile(userId: string, profileData: Record<string, unknown>) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Save a recipe for a user.
 * @param userId - The user's ID
 * @param recipeId - The recipe's ID
 */
export async function saveRecipe(userId: string, recipeId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('saved_recipes')
    .insert([{ user_id: userId, recipe_id: recipeId }])
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Get all recipes saved by a user.
 * @param userId - The user's ID
 */
export async function getSavedRecipes(userId: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('recipe_id, saved_at')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false })
  if (error) throw error
  return data
}

/**
 * Remove a saved recipe for a user.
 * @param userId - The user's ID
 * @param recipeId - The recipe's ID
 */
export async function removeSavedRecipe(userId: string, recipeId: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
  if (error) throw error
  return true
}

