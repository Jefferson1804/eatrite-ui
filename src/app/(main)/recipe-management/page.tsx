"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { Checkbox } from "@/components/ui/checkbox"
import { 
  BookOpen,
  FolderTree,
  Tags,
  Star,
  RotateCcw,
  Clock,
  Users,
  ChefHat,
  Edit,
  Share2,
  Copy,
  Trash2,
  ShoppingCart,
  Bot,
  Store,
  DollarSign,
  Smartphone,
  Plus,
  Calendar,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Target
} from "lucide-react"
import { toast } from "sonner"

// Types
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
  user_rating?: number
  times_cooked?: number
  last_cooked?: string
}

interface RecipeCollection {
  id: string
  name: string
  description: string
  recipe_count: number
  is_smart: boolean
  criteria: any
}

interface ShoppingListItem {
  id: string
  name: string
  amount: string
  unit: string
  category: string
  is_checked: boolean
  estimated_price?: number
  store_section?: string
}

interface MealPlanSummary {
  total_planned_meals: number
  upcoming_meals: number
  recipes_this_week: Recipe[]
}

interface UserStats {
  recipes_created: number
  meals_planned: number
  shopping_lists: number
  favorites: number
  total_cooking_time: number
  avg_recipe_rating: number
}

export default function RecipeManagementPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("management")
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingList, setIsGeneratingList] = useState(false)
  
  // Recipe Management State
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [collections, setCollections] = useState<RecipeCollection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [mealPlanSummary, setMealPlanSummary] = useState<MealPlanSummary | null>(null)

  // Shopping List State
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])
  const [selectedStore, setSelectedStore] = useState("grocery-store")
  const [totalEstimatedCost, setTotalEstimatedCost] = useState(0)
  const [listName, setListName] = useState("This Week's Shopping List")

  const router = useRouter()
  const supabase = createClient()

  // Load user and data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push("/login")
          return
        }

        setUser(user)

        // Load user's recipes
        const { data: recipesData, error: recipesError } = await supabase
          .from("recipes")
          .select(`
            *,
            recipe_ratings (rating),
            recipe_stats (times_cooked, last_cooked)
          `)
          .eq("author_id", user.id)
          .order("created_at", { ascending: false })

        if (recipesData) {
          const processedRecipes = recipesData.map(recipe => ({
            ...recipe,
            user_rating: recipe.recipe_ratings?.[0]?.rating,
            times_cooked: recipe.recipe_stats?.[0]?.times_cooked || 0,
            last_cooked: recipe.recipe_stats?.[0]?.last_cooked
          }))
          setRecipes(processedRecipes)
        }

        // Load recipe collections
        const { data: collectionsData } = await supabase
          .from("recipe_collections")
          .select("*, recipe_collection_items(count)")
          .eq("user_id", user.id)

        if (collectionsData) {
          const processedCollections = collectionsData.map(collection => ({
            ...collection,
            recipe_count: collection.recipe_collection_items?.length || 0
          }))
          setCollections(processedCollections)
        }

        // Load user statistics
        await loadUserStats(user.id)

        // Load meal plan summary
        await loadMealPlanSummary(user.id)

        // Load current shopping list
        await loadShoppingList(user.id)

      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])

  // Load user statistics
  const loadUserStats = async (userId: string) => {
    try {
      // Mock stats for demo - in real app, this would be calculated from database
      const stats: UserStats = {
        recipes_created: recipes.length,
        meals_planned: 21,
        shopping_lists: 3,
        favorites: recipes.filter(r => r.user_rating && r.user_rating >= 4).length,
        total_cooking_time: recipes.reduce((total, recipe) => total + (recipe.total_time_minutes || 0), 0),
        avg_recipe_rating: recipes.length > 0 ? recipes.reduce((sum, r) => sum + (r.rating_average || 0), 0) / recipes.length : 0
      }
      setUserStats(stats)
    } catch (error) {
      console.error("Error loading user stats:", error)
    }
  }

  // Load meal plan summary
  const loadMealPlanSummary = async (userId: string) => {
    try {
      const { data: mealPlanData } = await supabase
        .from("meal_plan_items")
        .select(`
          *,
          meal_plans!inner (user_id),
          recipes (*)
        `)
        .eq("meal_plans.user_id", userId)
        .gte("planned_date", new Date().toISOString().split('T')[0])

      if (mealPlanData) {
        const summary: MealPlanSummary = {
          total_planned_meals: mealPlanData.length,
          upcoming_meals: mealPlanData.filter(item => 
            new Date(item.planned_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          ).length,
          recipes_this_week: mealPlanData
            .filter(item => item.recipes)
            .map(item => item.recipes)
            .slice(0, 5)
        }
        setMealPlanSummary(summary)
      }
    } catch (error) {
      console.error("Error loading meal plan summary:", error)
    }
  }

  // Load shopping list
  const loadShoppingList = async (userId: string) => {
    try {
      const { data: listData } = await supabase
        .from("shopping_list_items")
        .select(`
          *,
          shopping_lists!inner (user_id)
        `)
        .eq("shopping_lists.user_id", userId)
        .eq("shopping_lists.is_active", true)

      if (listData) {
        const items: ShoppingListItem[] = listData.map(item => ({
          id: item.id,
          name: item.ingredient_name,
          amount: item.quantity.toString(),
          unit: item.unit,
          category: item.category || 'Other',
          is_checked: item.is_purchased,
          estimated_price: item.estimated_price,
          store_section: item.store_section
        }))
        setShoppingList(items)
        
        const total = items.reduce((sum, item) => sum + (item.estimated_price || 0), 0)
        setTotalEstimatedCost(total)
      }
    } catch (error) {
      console.error("Error loading shopping list:", error)
    }
  }

  // Generate shopping list from meal plan
  const handleGenerateShoppingList = async () => {
    if (!user) return

    setIsGeneratingList(true)
    
    try {
      // Get meal plan items for next week
      const startDate = new Date()
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      const { data: mealPlanItems } = await supabase
        .from("meal_plan_items")
        .select(`
          *,
          recipes (
            *,
            recipe_ingredients (*)
          ),
          meal_plans!inner (user_id)
        `)
        .eq("meal_plans.user_id", user.id)
        .gte("planned_date", startDate.toISOString().split('T')[0])
        .lte("planned_date", endDate.toISOString().split('T')[0])

      if (mealPlanItems) {
        // Extract ingredients and consolidate
        const ingredientMap = new Map<string, ShoppingListItem>()

        mealPlanItems.forEach(mealItem => {
          if (mealItem.recipes?.recipe_ingredients) {
            mealItem.recipes.recipe_ingredients.forEach((ingredient: any) => {
              const key = ingredient.ingredient_name.toLowerCase()
              const existing = ingredientMap.get(key)
              
              if (existing) {
                // Consolidate quantities (simplified logic)
                existing.amount = (parseFloat(existing.amount) + parseFloat(ingredient.quantity)).toString()
              } else {
                ingredientMap.set(key, {
                  id: `generated-${Date.now()}-${Math.random()}`,
                  name: ingredient.ingredient_name,
                  amount: ingredient.quantity.toString(),
                  unit: ingredient.unit,
                  category: ingredient.category || 'Other',
                  is_checked: false,
                  estimated_price: Math.random() * 10 + 1, // Mock price
                  store_section: getStoreSection(ingredient.category)
                })
              }
            })
          }
        })

        const newItems = Array.from(ingredientMap.values())
        setShoppingList(prev => [...newItems, ...prev.filter(item => !item.id.startsWith('generated-'))])
        
        const newTotal = newItems.reduce((sum, item) => sum + (item.estimated_price || 0), 0)
        setTotalEstimatedCost(prev => prev + newTotal)

        toast.success(`Generated shopping list with ${newItems.length} items`)
      }
    } catch (error) {
      console.error("Error generating shopping list:", error)
      toast.error("Failed to generate shopping list")
    } finally {
      setIsGeneratingList(false)
    }
  }

  // Get store section for category
  const getStoreSection = (category: string): string => {
    const sectionMap: { [key: string]: string } = {
      'Produce': 'Produce Section',
      'Dairy': 'Dairy & Refrigerated',
      'Meat': 'Meat & Seafood',
      'Pantry': 'Pantry & Dry Goods',
      'Frozen': 'Frozen Foods',
      'Bakery': 'Bakery',
      'Other': 'General Merchandise'
    }
    return sectionMap[category] || 'General Merchandise'
  }

  // Toggle shopping list item
  const toggleShoppingItem = (itemId: string) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, is_checked: !item.is_checked }
          : item
      )
    )
  }

  // Delete recipe
  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeId)

      if (error) throw error

      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
      toast.success("Recipe deleted successfully")
    } catch (error) {
      console.error("Error deleting recipe:", error)
      toast.error("Failed to delete recipe")
    }
  }

  // Get filtered recipes
  const getFilteredRecipes = () => {
    let filtered = recipes

    if (searchQuery) {
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCollection !== "all") {
      // Filter by collection - in real app, this would use collection membership
      filtered = filtered.filter(recipe => {
        switch (selectedCollection) {
          case "favorites":
            return recipe.user_rating && recipe.user_rating >= 4
          case "recent":
            return new Date(recipe.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          case "high-rated":
            return recipe.rating_average && recipe.rating_average >= 4
          default:
            return true
        }
      })
    }

    // Sort recipes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "rating":
          return (b.rating_average || 0) - (a.rating_average || 0)
        case "cook_time":
          return (a.total_time_minutes || 0) - (b.total_time_minutes || 0)
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }

  // Get shopping list by category
  const getShoppingListByCategory = () => {
    const categories = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Other']
    return categories.map(category => ({
      category,
      items: shoppingList.filter(item => item.category === category)
    })).filter(group => group.items.length > 0)
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
          <p className="text-muted-foreground">Please log in to access recipe management.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Recipe Management</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Organize, plan, and shop for your culinary adventures with intelligent tools and features.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button
          onClick={() => setActiveTab("management")}
          variant={activeTab === "management" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <FolderTree className="h-4 w-4" />
          Recipe Management
        </Button>
        <Button
          onClick={() => setActiveTab("shopping")}
          variant={activeTab === "shopping" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Shopping List Generation
        </Button>
      </div>

      {/* Recipe Management */}
      {activeTab === "management" && (
        <div className="space-y-6">
          {/* Management Tools */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <FolderTree className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Smart Collections</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically organize recipes by cuisine, dietary needs, cooking time, and difficulty level.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Tags className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Advanced Tagging</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Create custom tags and use AI-powered suggestions to categorize your recipe library.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Rating & Reviews</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Rate recipes, add personal notes, and track your family's favorites for easy access.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Version Control</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep track of recipe modifications and improvements with built-in version history.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Recipe Library */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Recipe Collection</CardTitle>
                    <CardDescription>
                      {getFilteredRecipes().length} recipes in your library
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Recipe
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="flex gap-4">
                  <Input
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="created_at">Newest First</option>
                    <option value="title">Name A-Z</option>
                    <option value="rating">Highest Rated</option>
                    <option value="cook_time">Quickest First</option>
                  </select>
                </div>

                {/* Recipe Grid */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {getFilteredRecipes().slice(0, 9).map((recipe) => (
                    <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <ChefHat className="h-8 w-8 text-muted-foreground" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold line-clamp-1">{recipe.title}</h3>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{recipe.total_time_minutes || 30} min</span>
                            <Users className="h-3 w-3" />
                            <span>{recipe.servings || 4} servings</span>
                            {recipe.rating_average && (
                              <>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{recipe.rating_average.toFixed(1)}</span>
                              </>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              {recipe.meal_type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {recipe.difficulty}
                            </Badge>
                          </div>

                          <div className="flex gap-1 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteRecipe(recipe.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {getFilteredRecipes().length === 0 && (
                  <div className="text-center py-8">
                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recipes found</p>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Collections */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Collections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedCollection === "all" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedCollection("all")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">All Recipes</span>
                      <span className="text-xs">{recipes.length}</span>
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedCollection === "favorites" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedCollection("favorites")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Favorites</span>
                      <span className="text-xs">{recipes.filter(r => r.user_rating && r.user_rating >= 4).length}</span>
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedCollection === "recent" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedCollection("recent")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recent</span>
                      <span className="text-xs">
                        {recipes.filter(r => new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              {userStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recipes Created</span>
                      <span className="font-semibold">{userStats.recipes_created}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meals Planned</span>
                      <span className="font-semibold">{userStats.meals_planned}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Shopping Lists</span>
                      <span className="font-semibold">{userStats.shopping_lists}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Favorites</span>
                      <span className="font-semibold">{userStats.favorites}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Meal Plan Preview */}
              {mealPlanSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      This Week's Meals
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {mealPlanSummary.upcoming_meals} meals planned
                    </div>
                    {mealPlanSummary.recipes_this_week.slice(0, 3).map((recipe) => (
                      <div key={recipe.id} className="text-sm p-2 bg-accent rounded">
                        {recipe.title}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      View Full Plan
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Generation */}
      {activeTab === "shopping" && (
        <div className="space-y-6">
          {/* Shopping Features */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Auto-Generation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically create shopping lists from your meal plans with intelligent ingredient consolidation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Store Optimization</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Organize lists by store layout and suggest the best stores for your ingredients.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Price Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Track ingredient prices and get alerts for deals on items in your shopping list.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Mobile Sync</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Access your shopping lists on your phone with real-time updates and voice input.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Shopping List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{listName}</CardTitle>
                    <CardDescription>
                      {shoppingList.filter(item => !item.is_checked).length} items remaining • 
                      Estimated total: ${totalEstimatedCost.toFixed(2)}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleGenerateShoppingList}
                    disabled={isGeneratingList}
                  >
                    {isGeneratingList ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Bot className="h-4 w-4 mr-2" />
                    )}
                    Generate from Meal Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {shoppingList.length > 0 ? (
                  <div className="space-y-4">
                    {getShoppingListByCategory().map((group) => (
                      <div key={group.category}>
                        <h3 className="font-semibold text-sm mb-2 text-muted-foreground">
                          {group.category}
                        </h3>
                        <div className="space-y-2">
                          {group.items.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-3 p-2 rounded border transition-all ${
                                item.is_checked ? "bg-muted text-muted-foreground" : "bg-background"
                              }`}
                            >
                              <Checkbox
                                checked={item.is_checked}
                                onCheckedChange={() => toggleShoppingItem(item.id)}
                              />
                              <div className="flex-1">
                                <div className={`font-medium ${item.is_checked ? "line-through" : ""}`}>
                                  {item.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.amount} {item.unit}
                                  {item.store_section && ` • ${item.store_section}`}
                                </div>
                              </div>
                              {item.estimated_price && (
                                <div className="text-sm font-medium">
                                  ${item.estimated_price.toFixed(2)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Your shopping list is empty</p>
                    <p className="text-sm text-muted-foreground">Generate a list from your meal plan to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Smart Features */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Smart Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">Duplicate Detection</div>
                    <p className="text-xs text-muted-foreground">
                      Automatically combines similar ingredients across recipes
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">Unit Conversion</div>
                    <p className="text-xs text-muted-foreground">
                      Intelligently converts and combines different measurement units
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">Pantry Check</div>
                    <p className="text-xs text-muted-foreground">
                      Removes items you already have in your pantry inventory
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="font-medium text-sm mb-1">Store Mapping</div>
                    <p className="text-xs text-muted-foreground">
                      Organizes list by grocery store aisle for efficient shopping
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shopping Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Items on list</span>
                    <span className="font-semibold">{shoppingList.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Items checked off</span>
                    <span className="font-semibold">{shoppingList.filter(item => item.is_checked).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estimated total</span>
                    <span className="font-semibold">${totalEstimatedCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average per item</span>
                    <span className="font-semibold">
                      ${shoppingList.length > 0 ? (totalEstimatedCost / shoppingList.length).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}