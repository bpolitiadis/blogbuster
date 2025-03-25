# BlogBuster

A full-stack blog platform where users can register, log in, post articles, and comment on posts.

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with Dark Mode Support
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Refresh tokens (custom)
- **Logging**: Winston logger with file and console transports
- **API Integration**: OpenAI API (for writing assistant) - planned
- **Deployment**: Vercel + MongoDB Atlas (planned)

## Project Setup (Completed)

- Scaffolded a Next.js 14 project with TypeScript, TailwindCSS, ESLint, and App Router
- Installed dependencies:
  - mongoose (MongoDB ODM)
  - bcryptjs (for password hashing)
  - jsonwebtoken (for JWT authentication)
  - winston (for logging)
  - mongodb (MongoDB driver)
  - @heroicons/react (for UI icons)
  - class-variance-authority (for component variants)
- Set up environment variables with `.env.local`
- Configured folder structure:
  - `src/lib`: Utility functions
  - `src/models`: Mongoose models
  - `src/api`: Server-side logic
  - `src/components`: Reusable UI components
  - `src/hooks`: Custom React hooks
  - `src/types`: TypeScript type definitions
  - `src/features`: Logical modules
  - `src/contexts`: React Context providers
- Created MongoDB connection utility in `src/lib/mongodb.ts` with:
  - Connection pooling and caching
  - Comprehensive error handling
  - Detailed logging of connection states
  - Automatic reconnection handling
- Created logging utility in `src/lib/logger.ts` with:
  - File and console transports
  - Different log levels (error, warn, info, debug)
  - Structured logging format
  - Automatic log rotation

## Features Implemented

### UI Components

- **Base Components**:
  - `Button`: Versatile button component with:
    - Multiple variants (default, destructive, outline, secondary, ghost, link)
    - Size options (default, sm, lg, icon)
    - Loading state with spinner
    - Dark mode support
    - Modern design with:
      - Rounded corners (rounded-lg)
      - Subtle shadow with hover effect
      - Scale animation on click
      - Smooth transitions
      - Accessible focus states
  - `Input`: Form input with error handling
  - `Textarea`: Multi-line text input with error handling
  - `Badge`: Label component with multiple style variants
  - `Avatar`: User avatar with image support and fallback initials
  - `Modal`: Dialog component with transitions and customizable content
  - `ThemeToggle`: Dark/Light mode toggle with system preference detection
  - `MoodSelector`: Dynamic mood selection with visual feedback

### Theme System

- Dynamic Dark/Light mode support:
  - System preference detection
  - User preference persistence in localStorage
  - Smooth transitions between themes
  - Accessible color contrast ratios
  - Consistent theming across all components
- Mood-based theming system:
  - 10 predefined moods with unique accent colors:
    - Dark: Surface dark with white text
    - Romantic: Pink accent (#F472B6)
    - Sci-Fi: Purple accent (#7C3AED)
    - Mystery: Gray accent (#6B7280)
    - Adventure: Amber accent (#F59E0B)
    - Fantasy: Violet accent (#8B5CF6)
    - Horror: Red accent (#EF4444)
    - Comedy: Green accent (#10B981)
    - Drama: Blue accent (#3B82F6)
    - Thriller: Pink accent (#EC4899)
  - Consistent primary/secondary colors across moods
  - Dynamic accent colors based on mood
  - Dark mode compatibility with all moods
  - Theme affects post display, buttons, and UI elements
  - Consistent visual experience across the platform

### Authentication System

- Secure JWT-based authentication with refresh tokens
- HTTP-only cookies for refresh tokens
- Password hashing with bcrypt
- Comprehensive logging of authentication events
- Detailed error tracking and reporting
- API Routes:
  - `POST /api/auth/register`: User registration
  - `POST /api/auth/login`: User authentication
  - `POST /api/auth/refresh`: Token refresh
  - `GET /api/auth/me`: User profile
  - `POST /api/auth/logout`: User logout
- Frontend Authentication:
  - Global auth context provider
  - Auth hooks for component integration
  - Protected routes with automatic redirection
  - Pages:
    - `/login`: User login form
    - `/register`: User registration form
    - `/profile`: User dashboard with XP, badges, and settings

### Post Management

- Complete CRUD operations for blog posts
- Text search and tag filtering
- Pagination support
- Author-only modifications
- XP rewards for post creation (50 XP)
- Mood-based theming system:
  - 10 predefined moods with unique accent colors:
    - Dark: Surface dark with white text
    - Romantic: Pink accent (#F472B6)
    - Sci-Fi: Purple accent (#7C3AED)
    - Mystery: Gray accent (#6B7280)
    - Adventure: Amber accent (#F59E0B)
    - Fantasy: Violet accent (#8B5CF6)
    - Horror: Red accent (#EF4444)
    - Comedy: Green accent (#10B981)
    - Drama: Blue accent (#3B82F6)
    - Thriller: Pink accent (#EC4899)
  - Consistent primary/secondary colors across moods
  - Dynamic accent colors based on mood
  - Dark mode compatibility with all moods
  - Theme affects post display, buttons, and UI elements
  - Consistent visual experience across the platform
- Debate system:
  - Users can challenge post authors to debates
  - Each participant gets one reply
  - Other users can vote on the debate
  - Debates end after 48 hours or 10 votes
  - Winner receives 100 XP
  - Real-time vote counting and status updates
- API Routes:
  - `POST /api/posts`: Create new post (protected)
  - `GET /api/posts`: List posts with search and filtering
  - `GET /api/posts/:id`: Get single post
  - `PUT /api/posts/:id`: Update post (author only)
  - `DELETE /api/posts/:id`: Delete post (author only)
- Frontend Post Pages:
  - `/`: Home feed with list of posts and filtering options
  - `/post/:id`: Single post view with comments and author details
  - `/create`: Post creation page with markdown support
  - `/edit/:id`: Post editing page with authorized access
  - Features:
    - Tag filtering on homepage
    - Mood-based theming
    - Comment threads with nested replies

### Comment System

- Nested comments support (replies to comments)
- Pagination for top-level comments
- Author association
- XP rewards for comment creation (10 XP)
- API Routes:
  - `POST /api/comments`: Add comment to post (protected)
  - `GET /api/comments/:postId`: Get comments for a post with replies

### User Progression System

- Experience Points (XP) system:
  - 50 XP for creating a post
  - 10 XP for creating a comment
  - 100 XP for winning a debate (planned)
- Level progression (100 XP per level)
- Achievement badges:
  - XP-based badges:
    - "XP Master" (1000 XP)
    - "XP Legend" (5000 XP)
  - Level-based badges:
    - "Rising Star" (Level 5)
    - "Veteran" (Level 10)
- Profile page with:
  - XP progress bar
  - Current level display
  - Badge showcase
  - Account settings

### Models

- **User Model**:
  - Username, email, password fields
  - Password hashing with bcrypt
  - Password comparison method
  - XP and level tracking
  - Badge collection
  - XP management methods
- **Post Model**:
  - Title, content, tags, mood fields
  - Author reference (ObjectId)
  - Timestamps (createdAt, updatedAt)
  - Text index for search functionality
  - XP reward on creation
  - Mood validation against predefined themes
- **Comment Model**:
  - Content and author fields
  - Post reference (ObjectId)
  - Optional parent comment for nesting
  - Creation timestamp
  - Compound index for efficient querying
  - XP reward on creation
- **Debate Model**:
  - Post and participant references
  - Structured replies from each participant
  - Vote tracking with user references
  - Automatic expiration after 48 hours
  - Winner determination based on votes
  - XP reward system for winners
  - Status tracking (active/completed)
  - Indexes for efficient querying

## Getting Started

First, create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
LOG_LEVEL=info  # Optional: Set logging level (error, warn, info, debug)
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Next Steps

- ~~Build authentication UI components (login/register forms)~~
- ~~Create post creation and editing interface~~
- ~~Implement post listing and detail pages~~
- ~~Add comment UI components and interactions~~
- ~~Implement XP and badge system~~
- Add OpenAI integration for writing assistance
- Add admin functionality
- Set up deployment configuration
- Add test coverage

## Docker Setup

The project includes Docker configuration for development, testing, and production environments.

### Development Environment

```bash
# Start development environment
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop development environment
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Testing Environment

```bash
# Start testing environment
docker compose -f docker-compose.yml -f docker-compose.test.yml up

# Stop testing environment
docker compose -f docker-compose.yml -f docker-compose.test.yml down
```

### Production Environment

```bash
# Start production environment
docker compose -f docker-compose.yml -f docker-compose.prod.yml up

# Stop production environment
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### Environment Variables

For development and testing, the following environment variables are set by default:

- `MONGODB_URI`: mongodb://mongodb:27017/blogbuster (dev) or mongodb://mongodb:27017/blogbuster_test (test)
- `MONGO_ROOT_USERNAME`: admin
- `MONGO_ROOT_PASSWORD`: password
- `LOG_LEVEL`: debug (dev) or error (test)

For production, you need to set these environment variables:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your JWT secret
- `JWT_REFRESH_SECRET`: Your refresh token secret
- `LOG_LEVEL`: info (recommended)
