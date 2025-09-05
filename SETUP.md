# Neuvera AI Setup Guide

## Overview
Neuvera AI is an intelligent conversation platform powered by Groq API. Users must sign in/sign up before accessing the chat functionality, and admin access is available through the footer logo.

## Features
- **Landing Page**: Prompts users to sign in/sign up before accessing chat
- **Chat Interface**: AI-powered conversations using Groq API
- **Admin Panel**: Accessible via footer logo with credentials (neuvera/1234@12)
- **Authentication**: Integrated with Clerk for user management

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
# DeepSeek API Configuration (already configured in code)
# NEXT_PUBLIC_DEEPSEEK_API_KEY=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

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the Application
- Open http://localhost:3000 in your browser
- Sign in/sign up to access the chat interface
- Click the footer logo to access admin panel (username: neuvera, password: 1234@12)

## User Flow
1. **Landing Page**: Users see the landing page with "Try Neuvera" button
2. **Authentication**: Clicking "Try Neuvera" opens Clerk's sign-in modal
3. **Chat Access**: After authentication, users can access the chat interface
4. **Admin Access**: Click the footer logo and enter admin credentials

## Admin Credentials
- Username: `neuvera`
- Password: `neuvera@007`

## API Integration
- **DeepSeek API**: Used for AI chat completions (API key already configured)
- **Clerk**: Handles user authentication and management
- **Tracking**: Built-in analytics and event tracking

## Troubleshooting
- Ensure all environment variables are properly set
- Check that DeepSeek API key is valid and has sufficient credits
- Verify Clerk configuration is correct
- Check browser console for any errors

## Development Notes
- The application uses Next.js 14 with App Router
- UI components are built with shadcn/ui
- State management is handled with React hooks
- Authentication state persists across sessions
