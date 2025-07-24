# AI Recipe Generation Setup

This guide will help you set up the AI recipe generation functionality using OpenAI.

## Prerequisites

1. An OpenAI API key (get one at https://platform.openai.com/api-keys)
2. Node.js and npm installed

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in the root directory with your OpenAI API key:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your-actual-openai-api-key-here

# Optional: Set to 'true' to use mock AI service for development
USE_MOCK_AI=false
```

### 2. Update Recipe Page for Production

In `src/app/(main)/recipes/page.tsx`, replace the mock service with the real AI service:

```typescript
// Find this line in handleGenerateRecipe function:
const aiService = new MockAIService()

// Replace it with:
const aiService = createAIService(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '')
```

### 3. Add Environment Variable to Next.js Config

Update `next.config.ts` to expose the API key to the client:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

export default nextConfig
```

## Features

The AI integration provides:

- **Recipe Generation**: Creates complete recipes based on available ingredients
- **Dietary Restrictions**: Respects vegetarian, vegan, gluten-free, etc.
- **Cuisine Preferences**: Generates recipes in specific cuisine styles
- **Nutritional Information**: Provides detailed nutrition facts
- **Cooking Tips**: Includes helpful cooking advice
- **Time Optimization**: Respects maximum cooking time constraints

## Development vs Production

- **Development**: Uses `MockAIService` for testing without API calls
- **Production**: Uses `AIService` with real OpenAI API calls

## Error Handling

The system includes comprehensive error handling for:
- Invalid API keys
- Network issues
- OpenAI API errors
- Malformed responses

## Security Notes

- Never commit your API key to version control
- Use environment variables for all sensitive data
- Consider implementing rate limiting for production use
- Monitor API usage to control costs

## Testing

1. Add ingredients to the form
2. Set dietary preferences and cooking time
3. Click "Generate Recipe"
4. Review the generated recipe with instructions and nutrition info
5. Use the "Generate Another Recipe" button to create variations 