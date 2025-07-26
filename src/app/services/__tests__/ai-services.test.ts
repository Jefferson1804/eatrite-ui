import { AIService, MockAIService, createAIService, RecipeResponse } from '../ai-services'

const mockApiKey = 'test-api-key'

describe('AIService', () => {
  let aiService: AIService

  beforeEach(() => {
    aiService = new AIService(mockApiKey)
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should generate a recipe (text)', async () => {
    const mockResponse: RecipeResponse = {
      title: 'Test Recipe',
      description: 'A test recipe',
      ingredients: [{ name: 'Egg', quantity: '2', unit: 'pcs' }],
      instructions: ['Step 1', 'Step 2'],
      nutritionInfo: { calories: 100, protein: '10g', carbs: '5g', fat: '2g', fiber: '1g' },
      cookingTime: 10,
      servings: 2,
      difficulty: 'Easy',
      tips: ['Tip 1']
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }]
      })
    })

    const result = await aiService.generateRecipe({
      ingredients: [{ name: 'Egg', quantity: '2', unit: 'pcs' }],
      dietaryRestrictions: [],
      cookingTime: 10,
      servings: 2
    })

    expect(result).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('should handle OpenAI API error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'API error' } }),
      statusText: 'Bad Request'
    })

    await expect(
      aiService.generateRecipe({
        ingredients: [{ name: 'Egg', quantity: '2', unit: 'pcs' }],
        dietaryRestrictions: [],
        cookingTime: 10,
        servings: 2
      })
    ).rejects.toThrow('OpenAI API error: API error')
  })

  it('should generate a recipe from image', async () => {
    const mockResponse: RecipeResponse = {
      title: 'Image Recipe',
      description: 'From image',
      ingredients: [{ name: 'Egg', quantity: '2', unit: 'pcs' }],
      instructions: ['Step 1'],
      nutritionInfo: { calories: 100, protein: '10g', carbs: '5g', fat: '2g', fiber: '1g' },
      cookingTime: 10,
      servings: 2,
      difficulty: 'Easy',
      tips: []
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockResponse) } }]
      })
    })

    const result = await aiService.generateRecipe({
      ingredients: [{ name: 'Egg', quantity: '2', unit: 'pcs' }],
      dietaryRestrictions: [],
      cookingTime: 10,
      servings: 2,
      imageBase64: 'base64string'
    })

    expect(result).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('should get recipe suggestions', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '1. Omelette\n2. Scrambled Eggs\n3. Egg Salad' } }]
      })
    })

    const result = await aiService.getRecipeSuggestions(['Egg'])
    expect(result).toEqual(['Omelette', 'Scrambled Eggs', 'Egg Salad'])
  })
})

describe('MockAIService', () => {
  let mockService: MockAIService

  beforeEach(() => {
    mockService = new MockAIService()
  })

  it('should generate a mock recipe', async () => {
    const result = await mockService.generateRecipe({
      ingredients: [{ name: 'Egg', quantity: '2', unit: 'pcs' }],
      dietaryRestrictions: [],
      cookingTime: 10,
      servings: 2
    })
    expect(result.title).toBeDefined()
    expect(result.ingredients.length).toBeGreaterThan(0)
  })

  it('should get mock recipe suggestions', async () => {
    const result = await mockService.getRecipeSuggestions(['Egg'])
    expect(result.length).toBe(3)
  })
})

describe('createAIService', () => {
  it('should create an AIService instance', () => {
    const service = createAIService('key')
    expect(service).toBeInstanceOf(AIService)
  })
})
