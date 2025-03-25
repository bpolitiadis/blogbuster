# BlogBuster

A full-stack blog platform where users can register, log in, post articles, and comment on posts.

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Refresh tokens (custom)
- **API Integration**: OpenAI API (for writing assistant) - planned
- **Deployment**: Vercel + MongoDB Atlas (planned)

## Project Setup (Completed)

- Scaffolded a Next.js 14 project with TypeScript, TailwindCSS, ESLint, and App Router
- Installed dependencies:
  - mongoose (MongoDB ODM)
  - bcryptjs (for password hashing)
  - jsonwebtoken (for JWT authentication)
- Set up environment variables with `.env.local`
- Configured folder structure:
  - `src/lib`: Utility functions
  - `src/models`: Mongoose models
  - `src/api`: Server-side logic
  - `src/components`: Reusable UI components
  - `src/hooks`: Custom React hooks
  - `src/types`: TypeScript type definitions
  - `src/features`: Logical modules
- Created MongoDB connection utility in `src/lib/mongodb.ts`

## Features Implemented

### UI Components

- **Base Components**:
  - `Button`: Versatile button component with variants and loading state
  - `Input`: Form input with error handling
  - `Textarea`: Multi-line text input with error handling
  - `Badge`: Label component with multiple style variants
  - `Avatar`: User avatar with image support and fallback initials
  - `Modal`: Dialog component with transitions and customizable content

### Authentication System

- Secure JWT-based authentication with refresh tokens
- HTTP-only cookies for refresh tokens
- Password hashing with bcrypt
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
- API Routes:
  - `POST /api/posts`: Create new post (protected)
  - `GET /api/posts`: List posts with search and filtering
  - `GET /api/posts/:id`: Get single post
  - `PUT /api/posts/:id`: Update post (author only)
  - `DELETE /api/posts/:id`: Delete post (author only)

### Comment System

- Nested comments support (replies to comments)
- Pagination for top-level comments
- Author association
- API Routes:
  - `POST /api/comments`: Add comment to post (protected)
  - `GET /api/comments/:postId`: Get comments for a post with replies

### Models

- **User Model**:
  - Username, email, password fields
  - Password hashing with bcrypt
  - Password comparison method
- **Post Model**:
  - Title, content, tags, mood fields
  - Author reference (ObjectId)
  - Timestamps (createdAt, updatedAt)
  - Text index for search functionality
- **Comment Model**:
  - Content and author fields
  - Post reference (ObjectId)
  - Optional parent comment for nesting
  - Creation timestamp
  - Compound index for efficient querying

## Getting Started

First, create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Next Steps

- Create post creation and editing interface
- Implement post listing and detail pages
- Add comment UI components and interactions
- Design and build UI templates
- Add OpenAI integration for writing assistance
- Add admin functionality
- Set up deployment configuration
- Add test coverage
