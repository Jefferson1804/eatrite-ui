"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, ChefHat, Clock, Users, Utensils, AlertCircle, CheckCircle, Sparkles, Search, Camera, Upload, Image as ImageIcon } from "lucide-react"
import { RecipeResult } from "@/components/recipe-result"
import { createAIService, MockAIService, type RecipeResponse } from "@/app/services/ai-services"

// Mock ingredient database for auto-suggest
const ingredientDatabase = [
  "chicken breast",
  "chicken thighs",
  "ground beef",
  "salmon",
  "tuna",
  "shrimp",
  "eggs",
  "milk",
  "butter",
  "cheese",
  "yogurt",
  "cream",
  "mozzarella",
  "parmesan",
  "rice",
  "pasta",
  "bread",
  "flour",
  "quinoa",
  "oats",
  "barley",
  "tomatoes",
  "onions",
  "garlic",
  "carrots",
  "potatoes",
  "bell peppers",
  "spinach",
  "broccoli",
  "mushrooms",
  "zucchini",
  "cucumber",
  "lettuce",
  "avocado",
  "olive oil",
  "vegetable oil",
  "coconut oil",
  "vinegar",
  "soy sauce",
  "salt",
  "pepper",
  "basil",
  "oregano",
  "thyme",
  "rosemary",
  "paprika",
  "cumin",
  "ginger",
  "apples",
  "bananas",
  "oranges",
  "lemons",
  "strawberries",
  "blueberries",
  "beans",
  "lentils",
  "chickpeas",
  "nuts",
  "almonds",
  "walnuts",
]

const units = ["cups", "tbsp", "tsp", "oz", "lbs", "g", "kg", "ml", "l", "pieces", "cloves", "whole"]

const dietaryRestrictions = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Low-Carb",
  "Keto",
  "Paleo",
]

const cuisineTypes = [
  "Italian",
  "Mexican",
  "Asian",
  "Mediterranean",
  "American",
  "Indian",
  "French",
  "Thai",
  "Japanese",
  "Greek",
]

interface Ingredient {
  id: string
  name: string
  quantity: string
  unit: string
  isValid: boolean
}

export default function EatRiteRecipeInput() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "", quantity: "", unit: "cups", isValid: true },
  ])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedDietary, setSelectedDietary] = useState<string[]>([])
  const [selectedCuisine, setSelectedCuisine] = useState("")
  const [cookingTime, setCookingTime] = useState([30])
  const [servings, setServings] = useState([4])
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeIngredientId, setActiveIngredientId] = useState<string | null>(null)
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeResponse | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  
  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-suggest functionality
  useEffect(() => {
    if (currentIngredient.length > 1) {
      const filtered = ingredientDatabase
        .filter((ingredient) => ingredient.toLowerCase().includes(currentIngredient.toLowerCase()))
        .slice(0, 5)
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [currentIngredient])

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: "",
      quantity: "",
      unit: "cups",
      isValid: true,
    }
    setIngredients([...ingredients, newIngredient])
  }

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((ing) => ing.id !== id))
    }
  }

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | boolean) => {
    setIngredients(ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)))

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }))
    }
  }

  const selectSuggestion = (suggestion: string, ingredientId: string) => {
    updateIngredient(ingredientId, "name", suggestion)
    setCurrentIngredient("")
    setShowSuggestions(false)
    setActiveIngredientId(null)
  }

  const toggleDietaryRestriction = (restriction: string) => {
    setSelectedDietary((prev) =>
      prev.includes(restriction) ? prev.filter((r) => r !== restriction) : [...prev, restriction],
    )
  }

  const handleGenerateRecipe = async () => {
    if (!validateForm() && !uploadedImage) return

    setIsGenerating(true)
    setAiError(null)

    try {
      // For development, use MockAIService. In production, use createAIService with your API key
      const aiService = new MockAIService()
      // const aiService = createAIService('your-openai-api-key-here')

      const validIngredients = ingredients.filter((ing) => ing.name && ing.quantity)
      
      const recipe = await aiService.generateRecipe({
        ingredients: validIngredients.map(ing => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit
        })),
        dietaryRestrictions: selectedDietary,
        cuisineType: selectedCuisine || undefined,
        cookingTime: cookingTime[0],
        servings: servings[0],
        additionalNotes: additionalNotes || undefined,
        imageBase64: uploadedImage || undefined
      })

      setGeneratedRecipe(recipe)
    } catch (error) {
      console.error('Recipe generation error:', error)
      setAiError(error instanceof Error ? error.message : 'Failed to generate recipe')
    } finally {
      setIsGenerating(false)
    }
  }

  // Image upload handlers
  const handleImageUpload = (file: File) => {
    setImageError(null)
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a valid image file')
      return
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image file size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // Remove the data:image/jpeg;base64, prefix to get just the base64 string
      const base64 = result.split(',')[1]
      setUploadedImage(base64)
      setImageFile(file)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageUpload(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImageFile(null)
    setImageError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Only validate ingredients if no image is uploaded
    if (!uploadedImage) {
      ingredients.forEach((ingredient) => {
        if (!ingredient.name.trim()) {
          newErrors[ingredient.id] = "Ingredient name is required"
        } else if (!ingredient.quantity.trim()) {
          newErrors[ingredient.id] = "Quantity is required"
        } else if (isNaN(Number(ingredient.quantity))) {
          newErrors[ingredient.id] = "Quantity must be a number"
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validIngredients = ingredients.filter((ing) => ing.name && ing.quantity)

  // Show recipe result if generated
  if (generatedRecipe) {
    return (
      <RecipeResult
        {...generatedRecipe}
        onBack={() => {
          setGeneratedRecipe(null)
          setAiError(null)
        }}
      />
    )
  }

  // Remove the custom header and page-level background. Use the global layout and color scheme instead.
  // The main content is now wrapped in a standard container for consistency with the rest of the app.
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Upload Section */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-purple-600" />
                <span>Upload Ingredient Photo</span>
                <Badge variant="secondary" className="ml-2">
                  Optional
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!uploadedImage ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload a photo of your ingredients
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Drag and drop an image here, or click to browse
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={`data:image/jpeg;base64,${uploadedImage}`}
                      alt="Uploaded ingredients"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Image uploaded successfully</span>
                  </div>
                </div>
              )}
              
              {imageError && (
                <div className="flex items-center space-x-2 mt-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{imageError}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ingredients Section */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-purple-600" />
                <span>Ingredients</span>
                <Badge variant="secondary" className="ml-2">
                  {validIngredients.length} added
                </Badge>
                {uploadedImage && (
                  <Badge variant="outline" className="ml-2 text-purple-600">
                    Or use photo above
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="relative">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    {/* Ingredient Name */}
                    <div className="col-span-6 relative">
                      <Input
                        placeholder="Enter ingredient..."
                        value={ingredient.name}
                        onChange={(e) => {
                          updateIngredient(ingredient.id, "name", e.target.value)
                          setCurrentIngredient(e.target.value)
                          setActiveIngredientId(ingredient.id)
                        }}
                        onFocus={() => {
                          setCurrentIngredient(ingredient.name)
                          setActiveIngredientId(ingredient.id)
                        }}
                        className={`${errors[ingredient.id] ? "border-red-500" : ""}`}
                        ref={activeIngredientId === ingredient.id ? inputRef : undefined}
                      />

                      {/* Auto-suggest dropdown */}
                      {showSuggestions && activeIngredientId === ingredient.id && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                          {suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              className="w-full px-3 py-2 text-left hover:bg-purple-50 hover:text-purple-700 text-sm"
                              onClick={() => selectSuggestion(suggestion, ingredient.id)}
                            >
                              <Search className="w-3 h-3 inline mr-2" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-3">
                      <Input
                        placeholder="Amount"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(ingredient.id, "quantity", e.target.value)}
                        className={`${errors[ingredient.id] ? "border-red-500" : ""}`}
                      />
                    </div>

                    {/* Unit */}
                    <div className="col-span-2">
                      <Select
                        value={ingredient.unit}
                        onValueChange={(value) => updateIngredient(ingredient.id, "unit", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIngredient(ingredient.id)}
                        disabled={ingredients.length === 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {errors[ingredient.id] && (
                    <div className="flex items-center space-x-1 mt-1 text-red-500 text-sm">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors[ingredient.id]}</span>
                    </div>
                  )}
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addIngredient}
                className="w-full border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Ingredient
              </Button>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recipe Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dietary Restrictions */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Dietary Restrictions</Label>
                <div className="flex flex-wrap gap-2">
                  {dietaryRestrictions.map((restriction) => (
                    <div key={restriction} className="flex items-center space-x-2">
                      <Checkbox
                        id={restriction}
                        checked={selectedDietary.includes(restriction)}
                        onCheckedChange={() => toggleDietaryRestriction(restriction)}
                        className="border-purple-300 data-[state=checked]:bg-purple-600"
                      />
                      <Label htmlFor={restriction} className="text-sm cursor-pointer">
                        {restriction}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cuisine Type */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Cuisine Preference</Label>
                <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineTypes.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cooking Time */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <Label className="text-base font-medium">Maximum Cooking Time: {cookingTime[0]} minutes</Label>
                </div>
                <Slider
                  value={cookingTime}
                  onValueChange={setCookingTime}
                  max={120}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10 min</span>
                  <span>60 min</span>
                  <span>120 min</span>
                </div>
              </div>

              {/* Servings */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <Label className="text-base font-medium">Servings: {servings[0]} people</Label>
                </div>
                <Slider value={servings} onValueChange={setServings} max={12} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 person</span>
                  <span>6 people</span>
                  <span>12 people</span>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-medium">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests, allergies, or preferences..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card className="bg-white/95 backdrop-blur-sm sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Recipe Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Preview */}
              {uploadedImage && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Uploaded Image</h4>
                  <div className="relative">
                    <img
                      src={`data:image/jpeg;base64,${uploadedImage}`}
                      alt="Ingredients"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Ingredients Summary */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  Ingredients ({validIngredients.length})
                  {uploadedImage && " or use image"}
                </h4>
                <div className="space-y-1">
                  {validIngredients.length > 0 ? (
                    validIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center space-x-1 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>
                          {ingredient.quantity} {ingredient.unit} {ingredient.name}
                        </span>
                      </div>
                    ))
                  ) : uploadedImage ? (
                    <p className="text-gray-500 text-sm">Will analyze ingredients from image</p>
                  ) : (
                    <p className="text-gray-500 text-sm">No ingredients added yet</p>
                  )}
                </div>
              </div>

              {/* Preferences Summary */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Preferences</h4>
                <div className="space-y-2">
                  {selectedDietary.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedDietary.map((diet) => (
                        <Badge key={diet} variant="secondary" className="text-xs">
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-gray-600 space-y-1">
                    {selectedCuisine && <div>🍽️ {selectedCuisine} cuisine</div>}
                    <div>⏱️ Max {cookingTime[0]} minutes</div>
                    <div>👥 {servings[0]} servings</div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {aiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{aiError}</span>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerateRecipe}
                disabled={(validIngredients.length === 0 && !uploadedImage) || isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Recipe...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Recipe</span>
                  </div>
                )}
              </Button>

              {(validIngredients.length === 0 && !uploadedImage) && (
                <p className="text-xs text-gray-500 text-center">
                  Add ingredients or upload an image to generate a recipe
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
