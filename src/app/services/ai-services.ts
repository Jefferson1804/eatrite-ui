interface RecipeRequest {
  ingredients: Array<{
    name: string
    quantity: string
    unit: string
  }>
  dietaryRestrictions: string[]
  cuisineType?: string
  cookingTime: number
  servings: number
  additionalNotes?: string
  imageBase64?: string // Add support for image input
}

export interface RecipeResponse {
  title: string
  description: string
  ingredients: Array<{
    name: string
    quantity: string
    unit: string
    notes?: string
  }>
  instructions: string[]
  nutritionInfo: {
    calories: number
    protein: string
    carbs: string
    fat: string
    fiber: string
  }
  cookingTime: number
  servings: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tips: string[]
}

interface AIError {
  message: string
  code?: string
}

/**
 * AI Service for recipe generation using OpenAI
 */
export class AIService {
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Generate a recipe based on provided ingredients and preferences
   */
  async generateRecipe(request: RecipeRequest): Promise<RecipeResponse> {
    try {
      // If image is provided, use vision model
      if (request.imageBase64) {
        return this.generateRecipeFromImage(request)
      }

      const prompt = this.buildRecipePrompt(request)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a professional chef and nutritionist. Generate detailed, practical recipes that are:
- Easy to follow with clear step-by-step instructions
- Nutritionally balanced and healthy
- Respectful of dietary restrictions
- Optimized for the specified cooking time and servings
- Include helpful cooking tips and variations

Always respond with valid JSON in the exact format specified.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response content from OpenAI')
      }

      // Parse the JSON response
      const recipeData = JSON.parse(content)
      return this.validateAndFormatRecipe(recipeData, request)
    } catch (error) {
      console.error('AI Service Error:', error)
      throw new Error(`Failed to generate recipe: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate a recipe from an image using OpenAI's vision model
   */
  private async generateRecipeFromImage(request: RecipeRequest): Promise<RecipeResponse> {
    try {
      const prompt = this.buildImageRecipePrompt(request)
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: `You are a professional chef and nutritionist. Analyze the image of ingredients and generate a detailed, practical recipe that:
- Uses the ingredients visible in the image
- Is easy to follow with clear step-by-step instructions
- Is nutritionally balanced and healthy
- Respects any dietary restrictions mentioned
- Is optimized for the specified cooking time and servings
- Includes helpful cooking tips and variations

Always respond with valid JSON in the exact format specified.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${request.imageBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response content from OpenAI')
      }

      // Parse the JSON response
      const recipeData = JSON.parse(content)
      return this.validateAndFormatRecipe(recipeData, request)
    } catch (error) {
      console.error('AI Service Error:', error)
      throw new Error(`Failed to generate recipe from image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Build a comprehensive prompt for image-based recipe generation
   */
  private buildImageRecipePrompt(request: RecipeRequest): string {
    const dietaryText = request.dietaryRestrictions.length > 0 
      ? `Dietary restrictions: ${request.dietaryRestrictions.join(', ')}. `
      : ''

    const cuisineText = request.cuisineType 
      ? `Cuisine style: ${request.cuisineType}. `
      : ''

    const notesText = request.additionalNotes 
      ? `Additional notes: ${request.additionalNotes}. `
      : ''

    return `Analyze the ingredients in this image and create a delicious recipe.

${dietaryText}${cuisineText}${notesText}
Requirements:
- Cooking time: ${request.cookingTime} minutes maximum
- Servings: ${request.servings} people
- Use ingredients visible in the image
- Include nutritional information
- Provide helpful cooking tips

Respond with a JSON object in this exact format:
{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "amount",
      "unit": "unit of measurement",
      "notes": "optional notes"
    }
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction",
    "Step 3 instruction"
  ],
  "nutritionInfo": {
    "calories": 350,
    "protein": "15g",
    "carbs": "45g", 
    "fat": "12g",
    "fiber": "8g"
  },
  "cookingTime": 30,
  "servings": 4,
  "difficulty": "Easy",
  "tips": [
    "Helpful cooking tip 1",
    "Helpful cooking tip 2"
  ]
}`
  }

  /**
   * Build a comprehensive prompt for recipe generation
   */
  private buildRecipePrompt(request: RecipeRequest): string {
    const ingredientsList = request.ingredients
      .map(ing => `${ing.quantity} ${ing.unit} ${ing.name}`)
      .join(', ')

    const dietaryText = request.dietaryRestrictions.length > 0 
      ? `Dietary restrictions: ${request.dietaryRestrictions.join(', ')}. `
      : ''

    const cuisineText = request.cuisineType 
      ? `Cuisine style: ${request.cuisineType}. `
      : ''

    const notesText = request.additionalNotes 
      ? `Additional notes: ${request.additionalNotes}. `
      : ''

    return `Create a delicious recipe using these ingredients: ${ingredientsList}.

${dietaryText}${cuisineText}${notesText}
Requirements:
- Cooking time: ${request.cookingTime} minutes maximum
- Servings: ${request.servings} people
- Must use all provided ingredients
- Include nutritional information
- Provide helpful cooking tips

Respond with a JSON object in this exact format:
{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "amount",
      "unit": "unit of measurement",
      "notes": "optional notes"
    }
  ],
  "instructions": [
    "Step 1 instruction",
    "Step 2 instruction",
    "Step 3 instruction"
  ],
  "nutritionInfo": {
    "calories": 350,
    "protein": "15g",
    "carbs": "45g", 
    "fat": "12g",
    "fiber": "8g"
  },
  "cookingTime": 30,
  "servings": 4,
  "difficulty": "Easy",
  "tips": [
    "Helpful cooking tip 1",
    "Helpful cooking tip 2"
  ]
}`
  }

  /**
   * Validate and format the recipe response
   */
  private validateAndFormatRecipe(data: Record<string, unknown>, originalRequest: RecipeRequest): RecipeResponse {
    // Ensure all required fields are present
    const recipe: RecipeResponse = {
      title: (data.title as string) || 'Generated Recipe',
      description: (data.description as string) || 'A delicious recipe made with your ingredients',
      ingredients: (data.ingredients as RecipeResponse['ingredients']) || [],
      instructions: (data.instructions as string[]) || [],
      nutritionInfo: {
        calories: ((data.nutritionInfo as Record<string, unknown>)?.calories as number) || 0,
        protein: ((data.nutritionInfo as Record<string, unknown>)?.protein as string) || '0g',
        carbs: ((data.nutritionInfo as Record<string, unknown>)?.carbs as string) || '0g',
        fat: ((data.nutritionInfo as Record<string, unknown>)?.fat as string) || '0g',
        fiber: ((data.nutritionInfo as Record<string, unknown>)?.fiber as string) || '0g',
      },
      cookingTime: (data.cookingTime as number) || originalRequest.cookingTime,
      servings: (data.servings as number) || originalRequest.servings,
      difficulty: (data.difficulty as RecipeResponse['difficulty']) || 'Medium',
      tips: (data.tips as string[]) || [],
    }

    return recipe
  }

  /**
   * Get recipe suggestions based on available ingredients
   */
  async getRecipeSuggestions(ingredients: string[]): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful cooking assistant. Suggest 3 recipe ideas based on the provided ingredients.'
            },
            {
              role: 'user',
              content: `Suggest 3 recipe ideas using these ingredients: ${ingredients.join(', ')}. Respond with a simple list.`
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get recipe suggestions')
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content || ''
      
      // Parse the suggestions (assuming they're numbered or bulleted)
      return content
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, ''))
        .slice(0, 3)
    } catch (error) {
      console.error('Error getting recipe suggestions:', error)
      return []
    }
  }
}

/**
 * Create an AI service instance
 * Note: In production, the API key should be stored securely in environment variables
 */
export function createAIService(apiKey: string): AIService {
  return new AIService(apiKey)
}

/**
 * Mock AI service for development/testing
 */
export class MockAIService {
  async generateRecipe(request: RecipeRequest): Promise<RecipeResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // If image is provided, simulate image-based generation
    if (request.imageBase64) {
      return {
        title: "Image-Based Recipe",
        description: "A delicious recipe created from your ingredient photo",
        ingredients: [
          { name: "Fresh vegetables", quantity: "2", unit: "cups", notes: "From your photo" },
          { name: "Protein", quantity: "1", unit: "lb", notes: "Visible in image" },
          { name: "Seasonings", quantity: "to taste", unit: "tsp", notes: "As needed" }
        ],
        instructions: [
          "Analyze the ingredients from your photo",
          "Prepare and wash all vegetables",
          "Cook protein to desired doneness",
          "Combine ingredients and season to taste",
          "Serve hot and enjoy!"
        ],
        nutritionInfo: {
          calories: 400,
          protein: "25g",
          carbs: "30g",
          fat: "15g",
          fiber: "10g"
        },
        cookingTime: request.cookingTime,
        servings: request.servings,
        difficulty: "Easy",
        tips: [
          "Use fresh ingredients for best results",
          "Adjust cooking time based on ingredient sizes"
        ]
      }
    }
    
    return {
      title: "Delicious Recipe",
      description: "A tasty dish made with your ingredients",
      ingredients: request.ingredients.map(ing => ({
        ...ing,
        notes: "Fresh ingredients recommended"
      })),
      instructions: [
        "Prepare all ingredients as listed",
        "Heat oil in a large pan over medium heat",
        "Add ingredients and cook until done",
        "Season to taste and serve hot"
      ],
      nutritionInfo: {
        calories: 350,
        protein: "15g",
        carbs: "45g",
        fat: "12g",
        fiber: "8g"
      },
      cookingTime: request.cookingTime,
      servings: request.servings,
      difficulty: "Easy",
      tips: [
        "Use fresh ingredients for best results",
        "Adjust seasoning to your taste preferences"
      ]
    }
  }

  async getRecipeSuggestions(ingredients: string[]): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return [
      "Stir-fry with vegetables",
      "Pasta dish with sauce",
      "Quick salad with protein"
    ]
  }
}
