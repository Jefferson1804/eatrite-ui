"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { 
  Calendar as CalendarIcon,
  Plus,
  ChefHat,
  Clock,
  Users,
  Utensils,
  Sparkles,
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Heart
} from "lucide-react"
import { toast } from "sonner"
import { createAIService, MockAIService, type RecipeResponse } from "@/app/services/ai-services"

// Types
interface MealPlan {
  id: string
  user_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MealPlanItem {
  id: string
  meal_plan_id: string
  recipe_id: string | null
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
  planned_date: string
  servings: number
  notes: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

interface Recipe {
  id: string
  title: string
  description: string | null
  instructions: string
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  total_time_minutes: number | null
  servings: number | null
  difficulty: 'easy' | 'medium' | 'hard'
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
  cuisine_type: string | null
  tags: string[]
  image_url: string | null
  author_id: string | null
  is_public: boolean
  rating_average: number | null
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  dietary_preferences: string[]
  allergies: string[]
  goals: string[]
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '🌞' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snack', label: 'Snack', emoji: '🍎' },
  { value: 'dessert', label: 'Dessert', emoji: '🍰' }
]

const TIME_FRAMES = [
  { value: '7', label: '1 Week' },
  { value: '14', label: '2 Weeks' },
  { value: '30', label: '1 Month' }
]

export default function MealPlanPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null)
  const [mealPlanItems, setMealPlanItems] = useState<MealPlanItem[]>([])
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [timeFrame, setTimeFrame] = useState('7')
  const [planName, setPlanName] = useState('')
  const [planDescription, setPlanDescription] = useState('')
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'>('breakfast')
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [servings, setServings] = useState(1)
  const [mealNotes, setMealNotes] = useState('')
  const [aiError, setAiError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // Load user and data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log("Loading user data...")
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          console.error("Auth error:", authError)
          router.push("/login")
          return
        }

        console.log("User authenticated:", user.id)
        setUser(user)

        // Load user profile
        console.log("Loading user profile...")
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("dietary_preferences, allergies, goals")
          .eq("id", user.id)
          .single()

        console.log("Profile data:", profileData, "Profile error:", profileError)

        setProfile(profileData ? {
          id: user.id,
          dietary_preferences: profileData.dietary_preferences || [],
          allergies: profileData.allergies || [],
          goals: profileData.goals || []
        } : {
          id: user.id,
          dietary_preferences: [],
          allergies: [],
          goals: []
        })

        // Load meal plans
        console.log("Loading meal plans...")
        const { data: plansData, error: plansError } = await supabase
          .from("meal_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        console.log("Meal plans data:", plansData, "Meal plans error:", plansError)
        setMealPlans(plansData || [])

        // Load saved recipes
        console.log("Loading saved recipes...")
        const { data: recipesData, error: recipesError } = await supabase
          .from("recipes")
          .select("*")
          .eq("author_id", user.id)
          .order("created_at", { ascending: false })

        console.log("Recipes data:", recipesData, "Recipes error:", recipesError)
        setSavedRecipes(recipesData || [])

      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])

  // Load meal plan items when a plan is selected
  useEffect(() => {
    if (!selectedMealPlan) {
      setMealPlanItems([])
      return
    }

    const loadMealPlanItems = async () => {
      try {
        const { data: itemsData } = await supabase
          .from("meal_plan_items")
          .select(`
            *,
            recipes (
              id,
              title,
              description,
              meal_type,
              total_time_minutes,
              servings
            )
          `)
          .eq("meal_plan_id", selectedMealPlan.id)
          .order("planned_date", { ascending: true })

        setMealPlanItems(itemsData || [])
      } catch (error) {
        console.error("Error loading meal plan items:", error)
        toast.error("Failed to load meal plan items")
      }
    }

    loadMealPlanItems()
  }, [selectedMealPlan, supabase])

  // Create new meal plan
  const handleCreateMealPlan = async () => {
    if (!user || !planName.trim()) {
      toast.error("Please enter a plan name")
      return
    }

    try {
      // Verify user authentication
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !currentUser) {
        console.error("Authentication error:", authError)
        toast.error("Authentication error. Please log in again.")
        return
      }

      // Check if user profile exists
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", currentUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile error:", profileError)
        toast.error("User profile error. Please check your profile settings.")
        return
      }

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + parseInt(timeFrame))

      console.log("Creating meal plan with data:", {
        user_id: currentUser.id,
        name: planName,
        description: planDescription,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        is_active: true
      })

      const { data: planData, error } = await supabase
        .from("meal_plans")
        .insert({
          user_id: currentUser.id,
          name: planName,
          description: planDescription,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error("Database error:", error)
        if (error.code === '42501') {
          toast.error("Permission denied. Please check your account permissions.")
        } else if (error.code === '23505') {
          toast.error("A meal plan with this name already exists.")
        } else {
          toast.error(`Database error: ${error.message}`)
        }
        throw error
      }

      setMealPlans([planData, ...mealPlans])
      setSelectedMealPlan(planData)
      setShowCreatePlan(false)
      setPlanName('')
      setPlanDescription('')
      toast.success("Meal plan created successfully")
    } catch (error) {
      console.error("Error creating meal plan:", error)
      if (error instanceof Error) {
        toast.error(`Failed to create meal plan: ${error.message}`)
      } else {
        toast.error("Failed to create meal plan")
      }
    }
  }

  // Add meal to plan
  const handleAddMeal = async () => {
    if (!selectedMealPlan || !selectedDate) {
      toast.error("Please select a meal plan and date")
      return
    }

    try {
      const { data: mealData, error } = await supabase
        .from("meal_plan_items")
        .insert({
          meal_plan_id: selectedMealPlan.id,
          recipe_id: selectedRecipe || null,
          meal_type: selectedMealType,
          planned_date: selectedDate.toISOString().split('T')[0],
          servings: servings,
          notes: mealNotes || null
        })
        .select()
        .single()

      if (error) throw error

      setMealPlanItems([...mealPlanItems, mealData])
      setShowAddMeal(false)
      setSelectedRecipe('')
      setServings(1)
      setMealNotes('')
      toast.success("Meal added to plan")
    } catch (error) {
      console.error("Error adding meal:", error)
      toast.error("Failed to add meal to plan")
    }
  }

  // Generate AI meal plan
  const handleGenerateMealPlan = async () => {
    if (!user || !selectedMealPlan) {
      toast.error("Please create or select a meal plan first")
      return
    }

    setIsGenerating(true)
    setAiError(null)

    try {
      // Use MockAIService for development
      const aiService = new MockAIService()
      
      // Generate meals for each day in the plan
      const startDate = new Date(selectedMealPlan.start_date)
      const endDate = new Date(selectedMealPlan.end_date)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(currentDate.getDate() + i)
        const dateString = currentDate.toISOString().split('T')[0]

        // Generate breakfast
        await generateMealForDay('breakfast', dateString)
        // Generate lunch
        await generateMealForDay('lunch', dateString)
        // Generate dinner
        await generateMealForDay('dinner', dateString)
      }

      toast.success("AI meal plan generated successfully")
    } catch (error) {
      console.error("Error generating meal plan:", error)
      setAiError(error instanceof Error ? error.message : 'Failed to generate meal plan')
      toast.error("Failed to generate meal plan")
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate meal for specific day and meal type
  const generateMealForDay = async (mealType: string, date: string) => {
    try {
      const aiService = new MockAIService()
      
      const recipe = await aiService.generateRecipe({
        ingredients: [],
        dietaryRestrictions: profile?.dietary_preferences || [],
        cuisineType: undefined,
        cookingTime: 45,
        servings: 2,
        additionalNotes: `Generate a ${mealType} recipe that fits the user's dietary preferences: ${profile?.dietary_preferences.join(', ') || 'none'}. Allergies: ${profile?.allergies.join(', ') || 'none'}. Health goals: ${profile?.goals.join(', ') || 'none'}`
      })

      // Save the generated recipe
      const { data: savedRecipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title: recipe.title,
          description: recipe.description,
          instructions: recipe.instructions.join('\n\n'),
          prep_time_minutes: recipe.cookingTime,
          cook_time_minutes: 0,
          servings: recipe.servings,
          difficulty: recipe.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
          meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert',
          author_id: user!.id,
          is_public: false
        })
        .select()
        .single()

      if (recipeError) throw recipeError

      // Add to meal plan
      const { data: mealData, error: mealError } = await supabase
        .from("meal_plan_items")
        .insert({
          meal_plan_id: selectedMealPlan!.id,
          recipe_id: savedRecipe.id,
          meal_type: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert',
          planned_date: date,
          servings: recipe.servings,
          notes: `AI Generated - ${recipe.description}`
        })
        .select()
        .single()

      if (mealError) throw mealError

      // Update local state
      setMealPlanItems(prev => [...prev, mealData])
      setSavedRecipes(prev => [savedRecipe, ...prev])

    } catch (error) {
      console.error(`Error generating ${mealType} for ${date}:`, error)
    }
  }

  // Remove meal from plan
  const handleRemoveMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from("meal_plan_items")
        .delete()
        .eq("id", mealId)

      if (error) throw error

      setMealPlanItems(prev => prev.filter(meal => meal.id !== mealId))
      toast.success("Meal removed from plan")
    } catch (error) {
      console.error("Error removing meal:", error)
      toast.error("Failed to remove meal")
    }
  }

  // Get meals for selected date
  const getMealsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return mealPlanItems.filter(meal => meal.planned_date === dateString)
  }

  // Get meal emoji
  const getMealEmoji = (mealType: string) => {
    const meal = MEAL_TYPES.find(m => m.value === mealType)
    return meal?.emoji || '🍽️'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Authentication required</h2>
          <p className="text-muted-foreground">Please log in to access meal planning.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meal Planning</h1>
          <p className="text-muted-foreground">Plan your meals for the week or any time frame</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowCreatePlan(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </Button>
          {selectedMealPlan && (
            <Button 
              onClick={handleGenerateMealPlan}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              AI Generate
            </Button>
          )}
          <Button 
            onClick={async () => {
              try {
                const { data: { user } } = await supabase.auth.getUser()
                console.log("Current user:", user)
                
                const { data: profile } = await supabase
                  .from("user_profiles")
                  .select("*")
                  .eq("id", user?.id)
                  .single()
                console.log("User profile:", profile)
                
                toast.success("Debug info logged to console")
              } catch (error) {
                console.error("Debug error:", error)
                toast.error("Debug error - check console")
              }
            }}
            variant="outline"
            size="sm"
          >
            Debug
          </Button>
        </div>
      </div>

      <div className="grid gap-8 pt-15 lg:grid-cols-4">
        {/* Meal Plans List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Meal Plans</CardTitle>
            <CardDescription>Select a plan to view and edit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mealPlans.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No meal plans yet</p>
                <p className="text-sm text-muted-foreground">Create your first meal plan to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mealPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMealPlan?.id === plan.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMealPlan(plan)}
                  >
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Recipes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Saved Recipes</CardTitle>
            <CardDescription>Your saved recipes for meal planning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedRecipes.length === 0 ? (
              <div className="text-center py-8">
                <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No saved recipes yet</p>
                <p className="text-sm text-muted-foreground">Generate and save recipes to use in meal planning</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedRecipes.slice(0, 5).map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-3 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <h4 className="font-medium text-sm">{recipe.title}</h4>
                    {recipe.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{recipe.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {recipe.meal_type}
                      </Badge>
                      {recipe.total_time_minutes && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{recipe.total_time_minutes}min</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {savedRecipes.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{savedRecipes.length - 5} more recipes
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>
              {selectedMealPlan ? (
                `Viewing meals for: ${selectedMealPlan.name}`
              ) : (
                "Select a meal plan to view meals in calendar"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMealPlan ? (
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasMeal: (date) => {
                      const meals = getMealsForDate(date)
                      return meals.length > 0
                    }
                  }}
                  modifiersStyles={{
                    hasMeal: { backgroundColor: 'hsl(var(--primary) / 0.1)' }
                  }}
                />
                
                {selectedDate && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">
                      Meals for {selectedDate.toLocaleDateString()}
                    </h3>
                    <div className="space-y-2">
                      {getMealsForDate(selectedDate).map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getMealEmoji(meal.meal_type)}</span>
                            <div>
                              <p className="font-medium capitalize">{meal.meal_type}</p>
                              {meal.recipe_id && (
                                <p className="text-sm text-muted-foreground">
                                  {savedRecipes.find(r => r.id === meal.recipe_id)?.title || 'Recipe'}
                                </p>
                              )}
                              {meal.notes && (
                                <p className="text-xs text-muted-foreground">{meal.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{meal.servings} servings</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMeal(meal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {getMealsForDate(selectedDate).length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No meals planned for this date
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => setShowAddMeal(true)}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Meal
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a meal plan to view the calendar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Meal Plan Modal */}
      {showCreatePlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Meal Plan</CardTitle>
              <CardDescription>Set up a new meal plan for your preferred time frame</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., Weekly Meal Plan"
                />
              </div>
              <div>
                <Label htmlFor="planDescription">Description (Optional)</Label>
                <Textarea
                  id="planDescription"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Describe your meal plan..."
                />
              </div>
              <div>
                <Label htmlFor="timeFrame">Time Frame</Label>
                <Select value={timeFrame} onValueChange={setTimeFrame}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_FRAMES.map((frame) => (
                      <SelectItem key={frame.value} value={frame.value}>
                        {frame.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateMealPlan} className="flex-1">
                  Create Plan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreatePlan(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Meal to Plan</CardTitle>
              <CardDescription>Add a meal to your selected date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mealType">Meal Type</Label>
                                 <Select value={selectedMealType} onValueChange={(value: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert') => setSelectedMealType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((meal) => (
                      <SelectItem key={meal.value} value={meal.value}>
                        <span className="flex items-center gap-2">
                          <span>{meal.emoji}</span>
                          <span>{meal.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recipe">Recipe (Optional)</Label>
                <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a saved recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No recipe (custom meal)</SelectItem>
                    {savedRecipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="mealNotes">Notes (Optional)</Label>
                <Textarea
                  id="mealNotes"
                  value={mealNotes}
                  onChange={(e) => setMealNotes(e.target.value)}
                  placeholder="Add any notes about this meal..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMeal} className="flex-1">
                  Add Meal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddMeal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Error Display */}
      {aiError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">AI Generation Error</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{aiError}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
