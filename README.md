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

- Build authentication UI components (login/register forms)
- Create post creation and editing interface
- Implement post listing and detail pages
- Add comment functionality
- Design and build UI templates
- Add OpenAI integration for writing assistance
- Add admin functionality
- Set up deployment configuration
- Add test coverage
