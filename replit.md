# NeuraChat - AI Chatbot Application

## Project Overview
NeuraChat is a modern AI chatbot application built with React, TypeScript, and Express. The project has been successfully migrated from Lovable to Replit, featuring a robust client-server architecture with PostgreSQL database integration.

## Architecture

### Frontend (Client)
- **Framework**: React 18 with TypeScript
- **Router**: Wouter (replaces React Router for Replit compatibility)
- **State Management**: React Context + TanStack Query
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Theme**: Dark/Light mode support

### Backend (Server)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: In-memory storage (MemStorage) with database schema ready
- **API**: RESTful endpoints for authentication and messages

### Database Schema
- **Users**: id, username, password, isAdmin, createdAt
- **Messages**: id, userId, content, isUser, timestamp

## Key Features
- User authentication (login/register)
- Admin panel access for admin users
- Persistent chat history per user
- Real-time message interface
- Responsive dark/light theme
- Secure client-server separation

## Authentication
- Default admin: username "neuvera", password "1234"
- Regular users can register new accounts
- Session persistence via localStorage
- Secure password validation on server

## API Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/messages/:userId` - Fetch user messages
- `POST /api/messages` - Create new message

## Development Setup
- Database schema pushed successfully
- All Supabase dependencies removed
- Replit-compatible configuration
- Security best practices implemented

## Recent Changes
- **2025-08-13**: Completed migration from Lovable to Replit
  - Removed Supabase integration
  - Implemented PostgreSQL with Drizzle ORM
  - Updated routing from React Router to Wouter
  - Created secure authentication system
  - Established client-server separation
  - Added comprehensive error handling

## User Preferences
- No specific preferences recorded yet

## Migration Status
✅ All migration tasks completed successfully
✅ Project ready for deployment and further development