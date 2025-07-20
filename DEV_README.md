# 🍽️ EatRite – Development Setup Guide

This guide will walk you through setting up the EatRite project for development, from cloning the repository to running the application locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Jefferson1804/eatrite-ui.git
cd eatrite-ui
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following content:

```bash
# Supabase Configuration (Development Environment)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Note**: The above credentials are for the development environment. For production, you'll need to create your own Supabase project and use those credentials.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔧 Development Environment Details

### Project Structure

```
eatrite-ui/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                # Utility functions and configurations
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
└── components.json         # ShadCN UI configuration
```

### Key Technologies

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with new features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN UI** - Component library built on Radix UI
- **Supabase** - Backend as a Service (Database & Auth)

### Authentication System

The project includes a complete authentication system:

- **Login**: `/login` - User authentication
- **Registration**: `/auth/register` - New user signup
- **Password Reset**: `/auth/forgot-password` - Password recovery
- **Protected Routes**: `/dashboard` - Requires authentication

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🗄️ Database Setup

### Supabase Project Configuration

The development environment uses a shared Supabase project. If you need to create your own:

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Navigate to **Settings > API**
4. Copy the Project URL and anon key
5. Update your `.env.local` file

### Database Schema

The application expects the following tables in Supabase:

```sql
-- Users table (handled by Supabase Auth)
-- No additional setup needed for basic auth

-- Future tables for recipe management:
-- recipes, ingredients, user_preferences, etc.
```

## 🔐 Authentication Flow

1. **Registration**: Users can create accounts with email/password
2. **Email Verification**: New accounts require email confirmation
3. **Login**: Authenticated users can access protected routes
4. **Session Management**: Persistent login sessions with automatic refresh
5. **Password Reset**: Users can reset passwords via email

## 🐛 Troubleshooting

### Common Issues

**"Failed to fetch" error on login/register**
- Ensure `.env.local` file exists with correct Supabase credentials
- Verify the Supabase project is active and accessible
- Check browser console for detailed error messages

**Environment variables not loading**
- Restart the development server after creating `.env.local`
- Ensure variables are prefixed with `NEXT_PUBLIC_`
- Check file location (should be in project root)

**Authentication not working**
- Verify Supabase Auth is enabled in your project
- Check that email confirmations are configured
- Ensure the redirect URLs are properly set in Supabase

### Development Tips

1. **Hot Reload**: The development server supports hot reloading
2. **TypeScript**: All components are type-safe with TypeScript
3. **ESLint**: Code is automatically linted on save
4. **Tailwind**: Use Tailwind classes for styling
5. **ShadCN**: Use pre-built components from the UI library

## 📱 Testing the Application

### Test Accounts

For development testing, you can use these test accounts:

```
Email: test@eatrite.dev
Password: testpassword123

Email: admin@eatrite.dev
Password: adminpass123
```

### Manual Testing Checklist

- [ ] Registration flow works
- [ ] Email verification process
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error handling)
- [ ] Password reset flow
- [ ] Protected route access
- [ ] Logout functionality
- [ ] Session persistence

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Ensure all checks pass

## 📞 Support

For development issues:

1. Check the troubleshooting section above
2. Review the main README.md
3. Check Supabase documentation
4. Create an issue in the repository

## 🔄 Updates

Keep your development environment up to date:

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update to latest versions (use with caution)
npm update --latest
```

---

**Happy coding! 🎉**

For more information, see the main [README.md](./README.md) file. 