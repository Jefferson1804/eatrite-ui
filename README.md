# 🍽️ EatRite – Smart Recipe Engine

**EatRite** is a web-based AI-powered meal planning and recipe recommendation platform designed to help users make the most of their available ingredients, stay healthy, and reduce food waste. Built with **Next.js**, **ShadCN**, and **Supabase**, it supports both text and image input, offering personalized, health-conscious recipes tailored to each user's dietary preferences and goals.

---

## 🚀 Features

- 📝 **Text & Image Ingredient Input**  
  Quickly add ingredients via text or upload a photo of what's in your fridge.

- 🧠 **AI-Powered Recommendations**  
  Get personalized recipe suggestions powered by local or third-party AI (e.g., OpenAI, Claude AI).

- 🥗 **Dietary Preference Filtering**  
  Support for vegan, keto, gluten-free, allergy-safe, and other dietary needs.

- 📊 **Nutritional Information Display**  
  See calories, macros, and nutritional tags for every recipe.

- ❤️ **Favorites & Saved Recipes**  
  Save and organize recipes in your user profile.

- 📱 **Responsive UI**  
  Mobile-friendly and accessibility-compliant (WCAG 2.1).

---

## 🧱 Tech Stack

- **Frontend:** Next.js + ShadCN (Tailwind, Radix UI)
- **Backend:** Node.js (REST API)
- **Database:** Supabase (PostgreSQL)
- **AI Integration:** Ollama (local LLMs) + optional OpenAI API
- **Desktop Support:** Tauri
- **Authentication:** Supabase Auth (with Role-Based Access Control)
- **CI/CD:** GitHub Actions

---

## 📦 Installation

### 1. Clone the repo
```bash
git clone https://github.com/Jefferson1804/eatrite-ui.git
cd eatrite-ui
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
1. Go to [Supabase](https://supabase.com) and create a new project
2. Navigate to Settings > API in your project dashboard
3. Copy the Project URL and anon/public key

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Authentication Setup

The application includes a complete authentication system with:

- **Login/Registration**: Email and password authentication
- **Password Reset**: Forgot password functionality
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Session Management**: Persistent login sessions

### Authentication Routes:
- `/login` - User login
- `/auth/register` - User registration
- `/auth/forgot-password` - Password reset
- `/dashboard` - Protected dashboard (requires authentication)
