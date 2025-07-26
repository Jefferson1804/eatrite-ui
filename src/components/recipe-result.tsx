"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  Users, 
  ChefHat, 
  Utensils, 
  Flame, 
  CheckCircle, 
  Info, 
  Copy,
  Share2,
  Bookmark,
  ArrowLeft,
  Save,
  Loader2
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface NutritionInfo {
  calories: number
  protein: string
  carbs: string
  fat: string
  fiber: string
}

interface RecipeResultProps {
  title: string
  description: string
  ingredients: Array<{
    name: string
    quantity: string
    unit: string
    notes?: string
  }>
  instructions: string[]
  nutritionInfo: NutritionInfo
  cookingTime: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tips: string[]
  onBack: () => void
}

export function RecipeResult({
  title,
  description,
  ingredients,
  instructions,
  nutritionInfo,
  cookingTime,
  servings,
  difficulty,
  tips,
  onBack
}: RecipeResultProps) {
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const supabase = createClient()

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = async () => {
    const recipeText = `
${title}

${description}

Ingredients:
${ingredients.map(ing => `• ${ing.quantity} ${ing.unit} ${ing.name}${ing.notes ? ` (${ing.notes})` : ''}`).join('\n')}

Instructions:
${instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}

Nutrition (per serving):
• Calories: ${nutritionInfo.calories}
• Protein: ${nutritionInfo.protein}
• Carbs: ${nutritionInfo.carbs}
• Fat: ${nutritionInfo.fat}
• Fiber: ${nutritionInfo.fiber}

Cooking Time: ${cookingTime} minutes
Servings: ${servings}
Difficulty: ${difficulty}

Tips:
${tips.map(tip => `• ${tip}`).join('\n')}
    `.trim()

    try {
      await navigator.clipboard.writeText(recipeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy recipe:', error)
    }
  }

  const handleSaveRecipe = async () => {
    setIsSaving(true)
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error("Please log in to save recipes")
        return
      }

      // Save recipe to database
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title: title,
          description: description,
          instructions: instructions.join('\n\n'),
          prep_time_minutes: cookingTime,
          cook_time_minutes: 0,
          servings: servings,
          difficulty: difficulty.toLowerCase() as 'easy' | 'medium' | 'hard',
          meal_type: 'dinner' as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert',
          author_id: user.id,
          is_public: false
        })
        .select()
        .single()

      if (recipeError) throw recipeError

      setIsSaved(true)
      toast.success("Recipe saved successfully!")
      
      // Reset saved state after 3 seconds
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Error saving recipe:', error)
      toast.error("Failed to save recipe")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Generate Another Recipe</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy Recipe'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveRecipe}
              disabled={isSaving || isSaved}
              className="flex items-center space-x-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSaved ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save'}</span>
            </Button>
          </div>
        </div>

        {/* Recipe Header */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-gray-900">{title}</CardTitle>
                <p className="text-gray-600 text-lg">{description}</p>
              </div>
              <Badge className={`${getDifficultyColor(difficulty)} font-medium`}>
                {difficulty}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">{cookingTime} minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">{servings} servings</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">{nutritionInfo.calories} calories</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Utensils className="w-5 h-5 text-purple-600" />
                  <span>Ingredients</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </div>
                        {ingredient.notes && (
                          <div className="text-sm text-gray-600 mt-1">{ingredient.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChefHat className="w-5 h-5 text-purple-600" />
                  <span>Instructions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 leading-relaxed">{instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nutrition Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-purple-600" />
              <span>Nutrition Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{nutritionInfo.calories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{nutritionInfo.protein}</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{nutritionInfo.carbs}</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{nutritionInfo.fat}</div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{nutritionInfo.fiber}</div>
                <div className="text-sm text-gray-600">Fiber</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cooking Tips */}
        {tips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-purple-600" />
                <span>Cooking Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-900">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 