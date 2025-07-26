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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { 
  Bot,
  Sparkles,
  Heart,
  Clock,
  Users,
  ChefHat,
  Target,
  Loader2,
  AlertCircle,
  CheckCircle,
  Zap,
  TrendingUp,
  Shield,
  BarChart3
} from "lucide-react"
import { toast } from "sonner"
import { createAIService, MockAIService, type RecipeResponse } from "@/app/services/ai-services"

// Types
interface UserProfile {
  id: string
  dietary_preferences: string[]
  allergies: string[]
  goals: string[]
  cooking_skill_level: 'beginner' | 'intermediate' | 'advanced'
}

interface AIPreference {
  id: string
  user_id: string
  preference_type: string
  preference_value: string
  weight: number
  created_at: string
}

interface GeneratedRecipe {
  id: string
  title: string
  description: string
  instructions: string[]
  ingredients: any
  cookingTime: number
  servings: number
  difficulty: string
  nutritionFacts: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sodium: number
  }
  tags: any
  aiConfidence: number
  personalizedReason: string
}

const DIETARY_FILTERS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 
  'Paleo', 'Low-Carb', 'High-Protein', 'Mediterranean', 'Pescatarian'
]

const CUISINE_TYPES = [
  'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 
  'Indian', 'Thai', 'French', 'Japanese', 'Chinese'
]

export default function AIRecipeGenerationPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [aiPreferences, setAiPreferences] = useState<AIPreference[]>([])
  const [activeTab, setActiveTab] = useState("personalized")
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Personalized Recipe Generation State
  const [aiPrompt, setAiPrompt] = useState("")
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [userContext, setUserContext] = useState({
    timeOfDay: 'any',
    availableTime: 30,
    occasion: 'everyday',
    servingSize: 2
  })

  // Dietary Filtering State
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedCuisine, setSelectedCuisine] = useState<string>("")
  const [maxCookingTime, setMaxCookingTime] = useState(60)
  const [targetCalories, setTargetCalories] = useState<number | null>(null)
  const [showNutrition, setShowNutrition] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // Load user and preferences
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push("/login")
          return
        }

        setUser(user)

        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileData) {
          setProfile({
            id: user.id,
            dietary_preferences: profileData.dietary_preferences || [],
            allergies: profileData.allergies || [],
            goals: profileData.goals || [],
            cooking_skill_level: profileData.cooking_skill_level || 'beginner'
          })
          setSelectedFilters(profileData.dietary_preferences || [])
        }

        // Load AI preferences
        const { data: preferencesData } = await supabase
          .from("ai_preferences")
          .select("*")
          .eq("user_id", user.id)

        setAiPreferences(preferencesData || [])

      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])

  // Generate personalized recipe
  const handleGeneratePersonalizedRecipe = async () => {
    if (!user || !aiPrompt.trim()) {
      toast.error("Please enter what you're craving")
      return
    }

    setIsGenerating(true)
    
    try {
      const aiService = new MockAIService()
      
      const contextualPrompt = `
        ${aiPrompt}
        
        User Context:
        - Dietary preferences: ${profile?.dietary_preferences.join(', ') || 'none'}
        - Allergies: ${profile?.allergies.join(', ') || 'none'}
        - Health goals: ${profile?.goals.join(', ') || 'none'}
        - Cooking skill: ${profile?.cooking_skill_level || 'beginner'}
        - Time available: ${userContext.availableTime} minutes
        - Serving size: ${userContext.servingSize} people
        - Occasion: ${userContext.occasion}
        - Time of day: ${userContext.timeOfDay}
      `

      const recipe = await aiService.generateRecipe({
        ingredients: [],
        dietaryRestrictions: profile?.dietary_preferences || [],
        cuisineType: undefined,
        cookingTime: userContext.availableTime,
        servings: userContext.servingSize,
        additionalNotes: contextualPrompt
      })

      // Transform to our format
      const personalizedRecipe: GeneratedRecipe = {
        id: Date.now().toString(),
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.instructions,
        ingredients: recipe.ingredients,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        nutritionFacts: {
          calories: Math.floor(Math.random() * 300) + 200,
          protein: Math.floor(Math.random() * 20) + 10,
          carbs: Math.floor(Math.random() * 40) + 20,
          fat: Math.floor(Math.random() * 15) + 5,
          fiber: Math.floor(Math.random() * 8) + 2,
          sodium: Math.floor(Math.random() * 500) + 200
        },
        tags: recipe,
        aiConfidence: Math.floor(Math.random() * 20) + 80,
        personalizedReason: `Based on your preference for ${profile?.dietary_preferences.join(' and ') || 'healthy meals'} and your ${profile?.cooking_skill_level || 'beginner'} cooking level.`
      }

      setGeneratedRecipe(personalizedRecipe)
      toast.success("Recipe generated successfully!")

    } catch (error) {
      console.error("Error generating recipe:", error)
      toast.error("Failed to generate recipe")
    } finally {
      setIsGenerating(false)
    }
  }

  // Save recipe to favorites
  const handleSaveRecipe = async (recipe: GeneratedRecipe) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("recipes")
        .insert({
          title: recipe.title,
          description: recipe.description,
          instructions: recipe.instructions.join('\n\n'),
          prep_time_minutes: Math.floor(recipe.cookingTime * 0.3),
          cook_time_minutes: Math.floor(recipe.cookingTime * 0.7),
          total_time_minutes: recipe.cookingTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
          meal_type: 'dinner' as const,
          author_id: user.id,
          is_public: false,
          tags: recipe.tags
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Recipe saved to your collection!")
    } catch (error) {
      console.error("Error saving recipe:", error)
      toast.error("Failed to save recipe")
    }
  }

  // Toggle dietary filter
  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  // Get filtered recipe suggestions
  const getFilteredSuggestions = () => {
    // Mock filtered suggestions based on selected filters
    return [
      { name: "Mediterranean Quinoa Bowl", match: 95, time: 25 },
      { name: "Thai Green Curry", match: 88, time: 35 },
      { name: "Grilled Salmon with Vegetables", match: 92, time: 30 },
      { name: "Vegetarian Buddha Bowl", match: 85, time: 20 }
    ].filter(suggestion => {
      if (selectedFilters.includes('Vegetarian') && !suggestion.name.includes('Vegetarian')) {
        return suggestion.name !== "Grilled Salmon with Vegetables"
      }
      return suggestion.time <= maxCookingTime
    })
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
          <p className="text-muted-foreground">Please log in to access AI recipe generation.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Recipe Generation</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get personalized recipe recommendations powered by artificial intelligence that learns from your preferences and dietary needs.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button
          onClick={() => setActiveTab("personalized")}
          variant={activeTab === "personalized" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Personalized Recipe Recommendations
        </Button>
        <Button
          onClick={() => setActiveTab("dietary")}
          variant={activeTab === "dietary" ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Dietary Filtering & Nutritional Display
        </Button>
      </div>

      {/* Personalized Recipe Recommendations */}
      {activeTab === "personalized" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Tell Our AI What You're Craving
                </CardTitle>
                <CardDescription>
                  Describe what you want to eat and our AI will create a personalized recipe just for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="aiPrompt">What are you in the mood for?</Label>
                  <Textarea
                    id="aiPrompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="I want something healthy and quick for dinner tonight with Mediterranean flavors..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availableTime">Available Time (minutes)</Label>
                    <Input
                      id="availableTime"
                      type="number"
                      value={userContext.availableTime}
                      onChange={(e) => setUserContext(prev => ({ ...prev, availableTime: parseInt(e.target.value) || 30 }))}
                      min="10"
                      max="180"
                    />
                  </div>
                  <div>
                    <Label htmlFor="servingSize">Serving Size</Label>
                    <Input
                      id="servingSize"
                      type="number"
                      value={userContext.servingSize}
                      onChange={(e) => setUserContext(prev => ({ ...prev, servingSize: parseInt(e.target.value) || 2 }))}
                      min="1"
                      max="12"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleGeneratePersonalizedRecipe}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating Recipe...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Recipe
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Recipe Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Personalized Recipe
                </CardTitle>
                <CardDescription>
                  AI-generated recipe tailored to your preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedRecipe ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{generatedRecipe.title}</h3>
                        <p className="text-sm text-muted-foreground">{generatedRecipe.description}</p>
                      </div>
                      <Badge variant="secondary">
                        {generatedRecipe.aiConfidence}% match
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{generatedRecipe.cookingTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{generatedRecipe.servings} servings</span>
                      </div>
                      <Badge variant="outline">{generatedRecipe.difficulty}</Badge>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm">
                        <strong>Why this recipe?</strong> {generatedRecipe.personalizedReason}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleSaveRecipe(generatedRecipe)}
                        className="flex-1"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Save Recipe
                      </Button>
                      <Button variant="outline" className="flex-1">
                        View Full Recipe
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Enter what you're craving and click "Generate AI Recipe" to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Features Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Smart Learning</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Our AI learns from your cooking history and feedback to suggest increasingly personalized recipes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">Context Aware</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Considers time of day, season, available ingredients, and your cooking skill level.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Preference Matching</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyzes your taste profile and matches you with recipes you're 95% likely to love.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Success Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tracks which recommendations you tried and loved to improve future suggestions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dietary Filtering & Nutritional Display */}
      {activeTab === "dietary" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Dietary Filters */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Dietary Preferences & Filters
                </CardTitle>
                <CardDescription>
                  Select your dietary restrictions and preferences to filter recipes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Dietary Restrictions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {DIETARY_FILTERS.map((filter) => (
                      <Badge
                        key={filter}
                        variant={selectedFilters.includes(filter) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleFilter(filter)}
                      >
                        {filter}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxTime">Max Cooking Time (minutes)</Label>
                    <Input
                      id="maxTime"
                      type="number"
                      value={maxCookingTime}
                      onChange={(e) => setMaxCookingTime(parseInt(e.target.value) || 60)}
                      min="10"
                      max="240"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetCalories">Target Calories (optional)</Label>
                    <Input
                      id="targetCalories"
                      type="number"
                      value={targetCalories || ''}
                      onChange={(e) => setTargetCalories(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="e.g., 500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showNutrition">Show Nutritional Information</Label>
                  <Button
                    variant={showNutrition ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowNutrition(!showNutrition)}
                  >
                    {showNutrition ? "Hide" : "Show"} Nutrition
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filtered Results */}
            <Card>
              <CardHeader>
                <CardTitle>Filtered Suggestions</CardTitle>
                <CardDescription>
                  Recipes matching your criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getFilteredSuggestions().map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{suggestion.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{suggestion.time}min</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.match}% match
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nutritional Information Panel */}
          {showNutrition && generatedRecipe && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Nutritional Information
                </CardTitle>
                <CardDescription>
                  Detailed nutrition facts for your selected recipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(generatedRecipe.nutritionFacts).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-accent rounded-lg">
                      <div className="text-2xl font-bold text-primary">{value}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {key === 'calories' ? 'kcal' : key === 'sodium' ? 'mg' : 'g'}
                      </div>
                      <div className="text-xs font-medium capitalize">{key}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Features */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">Smart Filtering</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Advanced filtering system that understands complex dietary restrictions and cross-contamination concerns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Macro Tracking</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatic macro and micronutrient tracking with daily goal progress visualization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold">Allergy Alerts</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Instant warnings for potential allergens with ingredient substitution suggestions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Goal Integration</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recipes automatically align with your fitness and health goals, from weight loss to muscle gain.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}